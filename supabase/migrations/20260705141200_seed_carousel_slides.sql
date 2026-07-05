-- Seed default carousel slides with local authentic images
INSERT INTO public.carousel_slides (image_url, title, quote, display_order)
VALUES
('/images.jpeg', 'Welcome to St. John Paul II Kabianga Parish', '"I was glad when they said to me, ''Let us go to the house of the Lord.''" — Psalm 122:1', 0),
('/imag2es.jpeg', 'Growing Together in Faith', '"For where two or three gather in my name, there am I with them." — Matthew 18:20', 1),
('/images3.jpeg', 'Serving Our Community', '"Let your light so shine before men, that they may see your good works." — Matthew 5:16', 2);
