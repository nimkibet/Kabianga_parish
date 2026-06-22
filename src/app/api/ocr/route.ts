import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Generates a signed JWT for Google OAuth2 using the service account private key.
 */
function generateGoogleJWT(clientEmail: string, privateKey: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signInput = `${base64Header}.${base64Claim}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(privateKey, 'base64url');
  
  return `${signInput}.${signature}`;
}

/**
 * Exchanges the signed JWT for a Google API Access Token.
 */
async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwt = generateGoogleJWT(clientEmail, privateKey);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth request failed: ${errText}`);
  }
  
  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl parameter.' }, { status: 400 });
    }

    // 1. Locate and read the service account key
    const credentialsPath = path.join(process.cwd(), 'kabianga-parish-ocr-0322c2106a21.json');
    if (!fs.existsSync(credentialsPath)) {
      return NextResponse.json({ error: 'Google Cloud credentials not found on server.' }, { status: 500 });
    }

    const credentialsFile = fs.readFileSync(credentialsPath, 'utf8');
    const credentials = JSON.parse(credentialsFile);
    const clientEmail = credentials.client_email;
    const privateKey = credentials.private_key;

    if (!clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Invalid Google Cloud credentials format.' }, { status: 500 });
    }

    // 2. Fetch Google Access Token
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    // 3. Make OCR Annotation Request to Google Cloud Vision API
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate`;
    const visionBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    const visionRes = await fetch(visionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(visionBody),
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return NextResponse.json({ error: `Google Vision API request failed: ${errText}` }, { status: 502 });
    }

    const visionData = await visionRes.json();
    const textAnnotations = visionData.responses?.[0]?.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json({ text: '', message: 'No text detected in the image.' });
    }

    // The first item contains the entire block of detected text
    const fullText = textAnnotations[0].description;
    return NextResponse.json({ text: fullText });

  } catch (err: any) {
    console.error('OCR API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
