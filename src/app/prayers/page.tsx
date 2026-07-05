'use client';

import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileText, Download, Sparkles, HelpCircle } from 'lucide-react';

interface Bead {
  id: number;
  type: 'intro' | 'our-father' | 'hail-mary' | 'glory-be' | 'salutation' | 'sorrow' | 'creed' | 'conclusion';
  label: string;
  prayerName: string;
  prayerTextEn: string;
  prayerTextSw: string;
  mysteryTextEn?: string;
  mysteryTextSw?: string;
  // Visual positions (scaled to SVG viewbox 0-400 x 0-480)
  x: number;
  y: number;
}

export default function DevotionalPrayers() {
  const [activeTab, setActiveTab] = useState<'rosary' | 'devotionals' | 'pdfs'>('rosary');
  const [selectedRosary, setSelectedRosary] = useState<'marian' | 'stmichael' | 'sevensorrows'>('marian');
  const [currentBeadIndex, setCurrentBeadIndex] = useState(0);
  const [rosaryLanguage, setRosaryLanguage] = useState<'english' | 'swahili'>('english');
  const [selectedMysteryGroup, setSelectedMysteryGroup] = useState<'joyful' | 'luminous' | 'sorrowful' | 'glorious'>('joyful');

  // PDF resources configuration
  const pdfResources = [
    {
      title: 'Guide to Praying the Holy Rosary (English)',
      description: 'Step-by-step Dominican Rosary script with prayers, meditations, and diagrams.',
      url: 'https://www.usccb.org/prayer-and-worship/prayers-and-devotions/rosaries/upload/how-to-pray-the-rosary.pdf',
      size: '1.2 MB'
    },
    {
      title: 'Jinsi ya Kusali Rozari Takatifu (Kiswahili)',
      description: 'Mwongozo kamili wa kusali Rozari pamoja na siri zote na litania ya Bikira Maria.',
      url: 'https://catholicreadings.org/wp-content/uploads/2024/05/Rozari-Takatifu-Swahili-Prayer-Book.pdf',
      size: '850 KB'
    },
    {
      title: 'St. Michael Chaplet Devotional Guide',
      description: 'Historical background, visual layout, and prayer formulas for the St. Michael Chaplet.',
      url: 'https://www.ewtn.com/catholicism/library/file/document/michael-chaplet.pdf',
      size: '420 KB'
    },
    {
      title: 'Rosary of the Seven Sorrows Guide',
      description: 'The Servite Rosary guide, meditations on Our Lady of Sorrows, and accompanying prayers.',
      url: 'https://www.kofc.org/en/resources/faith-in-action-programs/family/family-prayer/11221-seven-sorrows-rosary.pdf',
      size: '680 KB'
    }
  ];

  // Marian Mysteries
  const marianMysteries = {
    joyful: [
      { nameEn: '1st Joyful Mystery: The Annunciation', nameSw: 'Siri ya 1 ya Furaha: Kupashwa Habari Bikira Maria', descEn: 'Mary learns she will bear the Son of God.', descSw: 'Malaika Gabriel anampasha habari Bikira Maria kwamba atamzaa Mwana wa Mungu.' },
      { nameEn: '2nd Joyful Mystery: The Visitation', nameSw: 'Siri ya 2 ya Furaha: Bikira Maria Kumtembelea Elizabeti', descEn: 'Mary visits her cousin Elizabeth.', descSw: 'Bikira Maria anamtembelea binamu yake Elizabeti aliyekuwa mjamzito.' },
      { nameEn: '3rd Joyful Mystery: The Nativity', nameSw: 'Siri ya 3 ya Furaha: Kuzaliwa kwa Yesu Kristo', descEn: 'Jesus is born in Bethlehem.', descSw: 'Yesu anazaliwa katika hori la kulia ng’ombe kule Bethlehemu.' },
      { nameEn: '4th Joyful Mystery: The Presentation', nameSw: 'Siri ya 4 ya Furaha: Yesu Kutolewa Hekaluni', descEn: 'Jesus is presented in the temple.', descSw: 'Yesu anatolewa hekaluni siku arobaini baada ya kuzaliwa kwake.' },
      { nameEn: '5th Joyful Mystery: Finding Jesus in the Temple', nameSw: 'Siri ya 5 ya Furaha: Yesu Kupatikana Hekaluni', descEn: 'Mary and Joseph find Jesus teaching.', descSw: 'Maria na Yosefu wanampata Yesu hekaluni akijadiliana na walimu wa Sheria.' },
    ],
    luminous: [
      { nameEn: '1st Luminous Mystery: Baptism in the Jordan', nameSw: 'Siri ya 1 ya Mwanga: Ubatizo wa Yesu Mtoni Yordani', descEn: 'John baptizes Jesus; God speaks.', descSw: 'Yohane Mbatizaji anamwosha Yesu mtoni Yordani na sauti ya Baba inasikika.' },
      { nameEn: '2nd Luminous Mystery: The Wedding at Cana', nameSw: 'Siri ya 2 ya Mwanga: Arusi ya Kana ya Galilaya', descEn: 'Jesus performs his first public miracle.', descSw: 'Yesu anageuza maji kuwa divai kwenye arusi baada ya Maria kumuomba.' },
      { nameEn: '3rd Luminous Mystery: Proclamation of the Kingdom', nameSw: 'Siri ya 3 ya Mwanga: Utangazaji wa Ufalme wa Mungu', descEn: 'Jesus calls all to repentance.', descSw: 'Yesu anahubiri akisema Ufalme wa Mungu umekaribia, tubuni na kuiamini Injili.' },
      { nameEn: '4th Luminous Mystery: The Transfiguration', nameSw: 'Siri ya 4 ya Mwanga: Yesu Kugeuka Sura', descEn: 'Jesus is revealed in glory to the apostles.', descSw: 'Yesu anageuka sura mbele ya Petro, Yakobo, na Yohane kwenye mlima Tabor.' },
      { nameEn: '5th Luminous Mystery: Institution of the Eucharist', nameSw: 'Siri ya 5 ya Mwanga: Kuwekwa kwa Sakramenti ya Ekaristi', descEn: 'Jesus shares his body and blood.', descSw: 'Yesu anaweka Sakramenti ya Ekaristi Takatifu wakati wa Karamu ya Mwisho.' },
    ],
    sorrowful: [
      { nameEn: '1st Sorrowful Mystery: Agony in the Garden', nameSw: 'Siri ya 1 ya Masikitiko: Yesu Kuteseka Bustanini', descEn: 'Jesus prays in Gethsemane.', descSw: 'Yesu anasali bustanini Gethsemane akitokwa jasho la damu kabla ya kukamatwa.' },
      { nameEn: '2nd Sorrowful Mystery: Scourging at the Pillar', nameSw: 'Siri ya 2 ya Masikitiko: Yesu Kupigwa Miijeledi', descEn: 'Jesus is brutally scourged.', descSw: 'Yesu anafungwa kwenye nguzo na kupigwa viboko vingi na askari.' },
      { nameEn: '3rd Sorrowful Mystery: Crowning with Thorns', nameSw: 'Siri ya 3 ya Masikitiko: Yesu Kuvikwa Taji ya Miiba', descEn: 'Soldiers mock Jesus with a crown of thorns.', descSw: 'Yesu anavikwa taji ya miiba kichwani na kufanyiwa dhihaka kuwa Mfalme wa Wayahudi.' },
      { nameEn: '4th Sorrowful Mystery: Carrying of the Cross', nameSw: 'Siri ya 4 ya Masikitiko: Yesu Kuchukua Msalaba', descEn: 'Jesus carries his heavy cross.', descSw: 'Yesu anabeba msalaba mzito begani mwake kwenda mlima Kalvari.' },
      { nameEn: '5th Sorrowful Mystery: The Crucifixion', nameSw: 'Siri ya 5 ya Masikitiko: Yesu Kusulibiwa na Kufa Msalabani', descEn: 'Jesus dies on the cross for us.', descSw: 'Yesu anapelekwa msalabani, anasulibiwa na kufa kwa ajili ya dhambi zetu.' },
    ],
    glorious: [
      { nameEn: '1st Glorious Mystery: The Resurrection', nameSw: 'Siri ya 1 ya Utukufu: Yesu Kufufuka katika Wafu', descEn: 'Jesus rises from the dead on the third day.', descSw: 'Yesu anafufuka katika wafu siku ya tatu kama alivyosema, akishinda kifo.' },
      { nameEn: '2nd Glorious Mystery: The Ascension', nameSw: 'Siri ya 2 ya Utukufu: Yesu Kupaa Mbinguni', descEn: 'Jesus ascends into heaven to reign.', descSw: 'Yesu anajipaa mbinguni mbele ya mitume wake na kuketi kuume kwa Baba.' },
      { nameEn: '3rd Glorious Mystery: Descent of the Holy Spirit', nameSw: 'Siri ya 3 ya Utukufu: Roho Mtakatifu Kushuka kwa Mitume', descEn: 'The Holy Spirit fills Mary and the Apostles.', descSw: 'Roho Mtakatifu anawashukia mitume na Bikira Maria kule ghorofani katika umbo la ndimi za moto.' },
      { nameEn: '4th Glorious Mystery: The Assumption of Mary', nameSw: 'Siri ya 4 ya Utukufu: Bikira Maria Kupalizwa Mbinguni', descEn: 'Mary is taken body and soul into heaven.', descSw: 'Bikira Maria anachukuliwa mbinguni mwili na roho baada ya kukamilisha maisha yake duniani.' },
      { nameEn: '5th Glorious Mystery: The Coronation of Mary', nameSw: 'Siri ya 5 ya Utukufu: Bikira Maria Kuvikwa Taji Mbinguni', descEn: 'Mary is crowned Queen of Heaven and Earth.', descSw: 'Bikira Maria anavikwa taji na Mungu kuwa Malkia wa Mbingu na Dunia.' },
    ]
  };

  // Common prayers templates
  const prayersTemplates = {
    creed: {
      nameEn: 'Apostles’ Creed', nameSw: 'Kanuni ya Imani ya Mitume',
      en: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
      sw: 'Nasadiki kwa Mungu Baba Mwenyezi, Muumba wa mbingu na dunia. Na kwa Yesu Kristo Mwanaye wa pekee Bwana wetu; aliyetungwa kwa uwezo wa Roho Mtakatifu, akazaliwa na Bikira Maria; akateswa kwa mamlaka ya Ponsyo Pilato, akasulibiwa, akafa, akazikwa; akashuka kuzimu; siku ya tatu akafufuka katika wafu; akapaa mbinguni, ameketi kuume kwa Mungu Baba Mwenyezi; kutoka huko atakuja kuwahukumu wazima na wafu. Nasadiki kwa Roho Mtakatifu, Kanisa takatifu Katoliki, ushirika wa watakatifu, ondoleo la dhambi, ufufuko wa miili, na uzima wa milele. Amina.'
    },
    ourFather: {
      nameEn: 'Our Father', nameSw: 'Baba Yetu',
      en: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
      sw: 'Baba Yetu uliye mbinguni, jina lako litukuzwe; ufalme wako uje; utakalo lifanyike duniani kama mbinguni. Utupe leo mkate wetu wa kila siku; utusamehe makosa yetu, kama tunavyowasamehe na sisi waliotukosea; usitutie katika kishawishi, lakini utuokoe na yule mwovu. Amina.'
    },
    hailMary: {
      nameEn: 'Hail Mary', nameSw: 'Salamu Maria',
      en: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
      sw: 'Salamu Maria, umejaa neema, Bwana yu nawe; umebarikiwa kuliko wanawake wote, na Yesu mzao wa tumbo lako amebarikiwa. Maria Mtakatifu, Mama wa Mungu, utuombee sisi wakosefu, sasa na wakati wa kufa kwetu. Amina.'
    },
    gloryBe: {
      nameEn: 'Glory Be', nameSw: 'Atukuzwe Baba',
      en: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
      sw: 'Atukuzwe Baba na Mwana na Roho Mtakatifu. Kama mwanzo na sasa na siku zote na milele. Amina.'
    },
    fatima: {
      nameEn: 'Fatima Prayer', nameSw: 'Sala ya Fatima',
      en: 'O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of thy mercy. Amen.',
      sw: 'Ee Yesu wangu, utusamehe dhambi zetu, utuepushe na moto wa milele, uongoze roho zote mbinguni, hasa zile zinazohitaji zaidi huruma yako. Amina.'
    },
    hailHolyQueen: {
      nameEn: 'Hail, Holy Queen', nameSw: 'Salamu Malkia',
      en: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.',
      sw: 'Salamu Malkia, Mama wa Huruma, uzima, utamu na matumaini yetu, salamu! Tunakulilia sisi wana wa Eva, tuliohamishwa. Tunakulalamikia tukitweta na kulia katika bonde hili la machozi. Haya basi, Mwombezi wetu, utuangalie kwa macho yako ya huruma. Na baada ya ugeni huu, utuonyeshe Yesu, mzao mbarikiwa wa tumbo lako. Ee mpole, Ee mwaminifu, Ee mtamu Bikira Maria. Utuombee, Mama Mtakatifu wa Mungu, tufanyike wastahili ahadi za Kristo. Amina.'
    }
  };

  // Dynamic builders for beads sequence with precise visual SVG coordinates
  const buildMarianBeads = (): Bead[] => {
    const list: Bead[] = [];
    const activeMysteries = marianMysteries[selectedMysteryGroup];

    // Introductory prayers (Tail going downwards)
    list.push({
      id: 1, type: 'creed', label: '1. Crucifix (Apostles’ Creed)', prayerName: prayersTemplates.creed.nameEn,
      prayerTextEn: prayersTemplates.creed.en, prayerTextSw: prayersTemplates.creed.sw,
      mysteryTextEn: 'Begin at the Crucifix: Make the Sign of the Cross and say the Apostles’ Creed.',
      mysteryTextSw: 'Anza kwenye Msalaba: Jitie Alama ya Msalaba na usali Kanuni ya Imani ya Mitume.',
      x: 200, y: 440
    });
    list.push({
      id: 2, type: 'our-father', label: '2. First Large Bead (Our Father)', prayerName: prayersTemplates.ourFather.nameEn,
      prayerTextEn: prayersTemplates.ourFather.en, prayerTextSw: prayersTemplates.ourFather.sw,
      mysteryTextEn: 'On the first large bead, say the Our Father for the Pope’s intentions.',
      mysteryTextSw: 'Kwenye punje kubwa ya kwanza, sali Baba Yetu kwa ajili ya nia za Baba Mtakatifu.',
      x: 200, y: 395
    });
    // 3 Hail Marys
    for (let i = 0; i < 3; i++) {
      list.push({
        id: 3 + i, type: 'hail-mary', label: `3. Small Bead ${i+1} (Hail Mary)`, prayerName: prayersTemplates.hailMary.nameEn,
        prayerTextEn: prayersTemplates.hailMary.en, prayerTextSw: prayersTemplates.hailMary.sw,
        mysteryTextEn: `Pray a Hail Mary for the increase of the virtue of ${i === 0 ? 'Faith' : i === 1 ? 'Hope' : 'Charity'}.`,
        mysteryTextSw: `Sali Salamu Maria kwa ajili ya kuongezewa fadhila ya ${i === 0 ? 'Imani' : i === 1 ? 'Matumaini' : 'Mapendo'}.`,
        x: 200, y: 360 - (i * 25)
      });
    }
    list.push({
      id: 6, type: 'glory-be', label: '4. Chain Space (Glory Be)', prayerName: prayersTemplates.gloryBe.nameEn,
      prayerTextEn: prayersTemplates.gloryBe.en, prayerTextSw: prayersTemplates.gloryBe.sw,
      mysteryTextEn: 'On the chain space, pray the Glory Be.',
      mysteryTextSw: 'Kwenye nafasi inayofuata, sali Atukuzwe Baba.',
      x: 200, y: 290
    });

    // 5 Decades mapped around a circle/ellipse loop
    // Center of loop is at (200, 150), X-radius = 115, Y-radius = 80
    // The bottom-most point is the Center Medal (200, 230), which is index 90 degrees in SVG coordinates
    // We map 55 beads around the loop
    const totalLoopBeads = 5 * 12; // 5 * (1 Our Father + 10 Hail Mary + 1 Glory Be)
    let beadId = 7;

    for (let decade = 0; decade < 5; decade++) {
      const mystery = activeMysteries[decade];
      
      // Our Father for the Decade
      const ofIndex = decade * 12;
      const ofAngle = 90 + ((ofIndex + 1) * (360 / 60)) * (Math.PI / 180);
      list.push({
        id: beadId++, type: 'our-father', label: `5. Decade ${decade+1} - Our Father`, prayerName: prayersTemplates.ourFather.nameEn,
        prayerTextEn: prayersTemplates.ourFather.en, prayerTextSw: prayersTemplates.ourFather.sw,
        mysteryTextEn: `Announce the ${mystery.nameEn} and pray the Our Father.`,
        mysteryTextSw: `Tangaza ${mystery.nameSw} na usali Baba Yetu.`,
        x: Math.round(200 + 115 * Math.cos(ofAngle)),
        y: Math.round(150 + 80 * Math.sin(ofAngle))
      });

      // 10 Hail Marys
      for (let hm = 0; hm < 10; hm++) {
        const hmIndex = decade * 12 + 1 + hm;
        const hmAngle = 90 + ((hmIndex + 1) * (360 / 60)) * (Math.PI / 180);
        list.push({
          id: beadId++, type: 'hail-mary', label: `6. Decade ${decade+1} - Hail Mary ${hm+1}`, prayerName: prayersTemplates.hailMary.nameEn,
          prayerTextEn: prayersTemplates.hailMary.en, prayerTextSw: prayersTemplates.hailMary.sw,
          mysteryTextEn: `Decade ${decade+1} • Bead ${hm+1}\n\nMeditation: ${mystery.nameEn}`,
          mysteryTextSw: `Fungu la ${decade+1} • Maria ${hm+1}\n\nTafakari: ${mystery.nameSw}`,
          x: Math.round(200 + 115 * Math.cos(hmAngle)),
          y: Math.round(150 + 80 * Math.sin(hmAngle))
        });
      }

      // Glory Be & Fatima Prayer at end of decade
      const gbIndex = decade * 12 + 11;
      const gbAngle = 90 + ((gbIndex + 1) * (360 / 60)) * (Math.PI / 180);
      list.push({
        id: beadId++, type: 'glory-be', label: `7. Decade ${decade+1} - Glory Be & Fatima`, prayerName: `${prayersTemplates.gloryBe.nameEn} & ${prayersTemplates.fatima.nameEn}`,
        prayerTextEn: `${prayersTemplates.gloryBe.en}\n\n[Fatima Prayer]:\n${prayersTemplates.fatima.en}`,
        prayerTextSw: `${prayersTemplates.gloryBe.sw}\n\n[Sala ya Fatima]:\n${prayersTemplates.fatima.sw}`,
        mysteryTextEn: `Conclude the decade with the Glory Be and the Fatima Prayer.`,
        mysteryTextSw: `Malizia fungu hili kwa Atukuzwe Baba na Sala ya Fatima.`,
        x: Math.round(200 + 115 * Math.cos(gbAngle)),
        y: Math.round(150 + 80 * Math.sin(gbAngle))
      });
    }

    // Conclusion prayers (Center Medal Piece)
    list.push({
      id: beadId++, type: 'conclusion', label: '8. Center Medal (Hail Holy Queen)', prayerName: prayersTemplates.hailHolyQueen.nameEn,
      prayerTextEn: prayersTemplates.hailHolyQueen.en, prayerTextSw: prayersTemplates.hailHolyQueen.sw,
      mysteryTextEn: 'Conclude the Rosary at the Center Medal by reciting the Hail, Holy Queen.',
      mysteryTextSw: 'Kamilisha Rozari kwenye Medali ya Kati kwa kusali Salamu Malkia.',
      x: 200, y: 235
    });

    return list;
  };

  // St. Michael Chaplet Beads Sequence (9 groups of 1 + 3)
  const buildStMichaelBeads = (): Bead[] => {
    const list: Bead[] = [];
    
    // Medal (Top Center)
    list.push({
      id: 1, type: 'intro', label: '1. Medal Opening Invocation', prayerName: 'Opening Invocation',
      prayerTextEn: 'O God, come to my assistance. O Lord, make haste to help me. Glory be to the Father...',
      prayerTextSw: 'Ee Mungu, uje kuniokoa. Ee Bwana, ufanye haraka kunisaidia. Atukuzwe Baba...',
      mysteryTextEn: 'Begin on the St. Michael Medal. Make the Sign of the Cross and invoke God’s assistance.',
      mysteryTextSw: 'Anza kwenye Medali ya Mtakatifu Mikaeli. Jitie Alama ya Msalaba na uombe msaada wa Mungu.',
      x: 200, y: 235
    });

    const salutations = [
      { en: '1st Salutation: Choir of Seraphim', sw: 'Salamu ya 1: Kwaya ya Maserafi', descEn: 'Ask for the grace of burning charity.', descSw: 'Omba neema ya mapendo yanayowaka moto.' },
      { en: '2nd Salutation: Choir of Cherubim', sw: 'Salamu ya 2: Kwaya ya Makerubi', descEn: 'Ask for grace to leave sin and enter Christian perfection.', descSw: 'Omba neema ya kuacha dhambi na kufikia ukamilifu wa Kikristo.' },
      { en: '3rd Salutation: Choir of Thrones', sw: 'Salamu ya 3: Kwaya ya Viti vya Enzi', descEn: 'Ask for a spirit of true and sincere humility.', descSw: 'Omba roho ya unyenyekevu wa kweli na wa dhati.' },
      { en: '4th Salutation: Choir of Dominations', sw: 'Salamu ya 4: Kwaya ya Mamlaka', descEn: 'Ask for grace to govern our senses and conquer passions.', descSw: 'Omba neema ya kutawala hisia zetu na kushinda tamaa mbaya.' },
      { en: '5th Salutation: Choir of Powers', sw: 'Salamu ya 5: Kwaya ya Nguvu', descEn: 'Ask for protection against the snares of the devil.', descSw: 'Omba ulinzi dhidi ya mitego na ushawishi wa shetani.' },
      { en: '6th Salutation: Choir of Virtues', sw: 'Salamu ya 6: Kwaya ya Fadhila', descEn: 'Ask to be preserved from evil and not fall into temptation.', descSw: 'Omba kulindwa na maovu na kutoanguka kwenye vishawishi.' },
      { en: '7th Salutation: Choir of Principalities', sw: 'Salamu ya 7: Kwaya ya Wakuu', descEn: 'Ask to be filled with a spirit of obedience.', descSw: 'Omba kujazwa na roho ya utii na unyenyekevu.' },
      { en: '8th Salutation: Choir of Archangels', sw: 'Salamu ya 8: Kwaya ya Malaika Wakuu', descEn: 'Ask for perseverance in faith and good works.', descSw: 'Omba uvumilivu katika imani na matendo mema.' },
      { en: '9th Salutation: Choir of Angels', sw: 'Salamu ya 9: Kwaya ya Malaika', descEn: 'Ask to be protected in this life and led to eternal glory.', descSw: 'Omba kulindwa katika maisha haya na kuongozwa kwenye utukufu wa milele.' }
    ];

    let beadId = 2;
    // Map loop of 9 groups (36 beads)
    for (let s = 0; s < 9; s++) {
      const sal = salutations[s];
      const baseAngle = 90 + (s * (360 / 9)) * (Math.PI / 180);

      // Large bead for Salutation Invocation
      list.push({
        id: beadId++, type: 'salutation', label: `2. Salutation ${s+1} Meditation`, prayerName: `Salutation ${s+1}`,
        prayerTextEn: `By the intercession of St. Michael and the Celestial Choir of ${sal.en.split(': ')[1]}, may the Lord vouchsafe to make us worthy...`,
        prayerTextSw: `Kwa uombezi wa Mt. Mikaeli na Kwaya ya Kimbingu ya ${sal.sw.split(': ')[1]}, Bwana atujalie kufanyika wastahili...`,
        mysteryTextEn: sal.en + '\n\n' + sal.descEn,
        mysteryTextSw: sal.sw + '\n\n' + sal.descSw,
        x: Math.round(200 + 115 * Math.cos(baseAngle)),
        y: Math.round(150 + 80 * Math.sin(baseAngle))
      });

      // 1 Our Father
      list.push({
        id: beadId++, type: 'our-father', label: `3. Salutation ${s+1} - Our Father`, prayerName: prayersTemplates.ourFather.nameEn,
        prayerTextEn: prayersTemplates.ourFather.en, prayerTextSw: prayersTemplates.ourFather.sw,
        mysteryTextEn: `Sali Baba Yetu 1.`,
        mysteryTextSw: `Sali Baba Yetu 1.`,
        x: Math.round(200 + 115 * Math.cos(baseAngle + 0.1)),
        y: Math.round(150 + 80 * Math.sin(baseAngle + 0.1))
      });

      // 3 Hail Marys
      for (let h = 0; h < 3; h++) {
        const hmAngle = baseAngle + 0.2 + (h * 0.08);
        list.push({
          id: beadId++, type: 'hail-mary', label: `4. Salutation ${s+1} - Hail Mary ${h+1}`, prayerName: prayersTemplates.hailMary.nameEn,
          prayerTextEn: prayersTemplates.hailMary.en, prayerTextSw: prayersTemplates.hailMary.sw,
          mysteryTextEn: `Sali Salamu Maria ya ${h+1} ya 3.`,
          mysteryTextSw: `Sali Salamu Maria ya ${h+1} ya 3.`,
          x: Math.round(200 + 115 * Math.cos(hmAngle)),
          y: Math.round(150 + 80 * Math.sin(hmAngle))
        });
      }
    }

    // 4 final Our Fathers on the tail (Crucifix downwards)
    const angels = ['St. Michael', 'St. Gabriel', 'St. Raphael', 'Our Guardian Angel'];
    const malaika = ['Mt. Mikaeli', 'Mt. Gabrieli', 'Mt. Rafaeli', 'Malaika Mlinzi'];
    for (let a = 0; a < 4; a++) {
      list.push({
        id: beadId++, type: 'our-father', label: `5. Our Father in honor of ${angels[a]}`, prayerName: `Our Father - ${angels[a]}`,
        prayerTextEn: prayersTemplates.ourFather.en, prayerTextSw: prayersTemplates.ourFather.sw,
        mysteryTextEn: `Pray an Our Father in honor of ${angels[a]}.`,
        mysteryTextSw: `Sali Baba Yetu kwa heshima ya ${malaika[a]}.`,
        x: 200, y: 280 + (a * 35)
      });
    }

    // Closing (Crucifix at bottom)
    list.push({
      id: beadId++, type: 'conclusion', label: '6. Medal Concluding Prayer', prayerName: 'Prayer to St. Michael',
      prayerTextEn: 'O glorious prince St. Michael, chief and leader of the heavenly hosts... pray for us.',
      prayerTextSw: 'Ee mkuu mtukufu Mtakatifu Mikaeli, kiongozi wa jeshi la mbinguni... utuombee.',
      mysteryTextEn: 'Recite the concluding prayer to St. Michael for protection and guidance.',
      mysteryTextSw: 'Sali sala ya mwisho ya kumalizia kuomba ulinzi wa Mtakatifu Mikaeli.',
      x: 200, y: 440
    });

    return list;
  };

  // 7 Sorrows Servite Rosary Beads Sequence (7 groups of 1 + 7)
  const buildSevenSorrowsBeads = (): Bead[] => {
    const list: Bead[] = [];
    
    // Opening (Crucifix bottom)
    list.push({
      id: 1, type: 'intro', label: '1. Opening Act of Contrition', prayerName: 'Act of Contrition',
      prayerTextEn: 'O my God, I am heartily sorry for having offended Thee... I resolve to sin no more. Amen.',
      prayerTextSw: 'Nakuungamia Mungu Mwenyezi, nasikitika sana kwa kukukosea... naahidi kutotenda dhambi tena. Amina.',
      mysteryTextEn: 'Begin with an Act of Contrition and 1 Our Father / 3 Hail Marys in honor of Mary’s tears.',
      mysteryTextSw: 'Anza kwa kusali Sala ya Toba na Baba Yetu 1 / Salamu Maria 3 kwa heshima ya machozi ya Mama Maria.',
      x: 200, y: 440
    });

    const sorrows = [
      { en: '1st Sorrow: The Prophecy of Simeon', sw: 'Sorrow ya 1: Utabiri wa Simeoni', descEn: 'Simeon foretells a sword will pierce Mary’s heart.', descSw: 'Simeoni anatabiri kuwa upanga utapenya moyo wa Bikira Maria kwa sababu ya Mwanaye.' },
      { en: '2nd Sorrow: The Flight into Egypt', sw: 'Sorrow ya 2: Kukimbilia Misri', descEn: 'Mary and Joseph flee to Egypt to save baby Jesus from Herod.', descSw: 'Maria na Yosefu wanamkimbiza Yesu mtoto kwenda Misri ili kuokoa maisha yake dhidi ya Mfalme Herode.' },
      { en: '3rd Sorrow: Loss of Jesus in the Temple', sw: 'Sorrow ya 3: Yesu Kupotea Hekaluni', descEn: 'Mary searches frantically for three days for Jesus.', descSw: 'Maria na Yosefu wanamtafuta Yesu kwa huzuni kubwa kwa siku tatu kabla ya kumpata hekaluni.' },
      { en: '4th Sorrow: Mary meets Jesus carrying the Cross', sw: 'Sorrow ya 4: Maria Kukutana na Yesu Akibeba Msalaba', descEn: 'Mary witnesses her scourged Son carrying his cross.', descSw: 'Bikira Maria anakutana na Mwanaye mpendwa barabarani akiwa amelazwa msalaba mzito begani.' },
      { en: '5th Sorrow: Mary stands at the foot of the Cross', sw: 'Sorrow ya 5: Maria Kusimama Chini ya Msalaba', descEn: 'Mary stands witness as Jesus is crucified and dies.', descSw: 'Maria anasimama kwa huzuni kuu akimshuhudia Yesu akisulibiwa na kufa msalabani.' },
      { en: '6th Sorrow: Mary receives the dead body of Jesus', sw: 'Sorrow ya 6: Mwili wa Yesu Kuwekwa Mikononi mwa Maria', descEn: 'Jesus’ body is taken down from the cross and placed in Mary’s arms.', descSw: 'Mwili wa Yesu unashushwa msalabani na kuwekwa mikononi mwa Mama yake mwenye majonzi.' },
      { en: '7th Sorrow: Jesus is placed in the Tomb', sw: 'Sorrow ya 7: Yesu Kuzikwa Kaburini', descEn: 'Mary weeps as Jesus is buried and the tomb sealed.', descSw: 'Mwili wa Yesu unazikwa kaburini na jiwe kubwa kufunga mlango wa kaburi.' }
    ];

    let beadId = 2;
    // Map loop of 7 groups (56 beads)
    for (let s = 0; s < 7; s++) {
      const sorrow = sorrows[s];
      const baseAngle = 90 + (s * (360 / 7)) * (Math.PI / 180);

      // Sorrow introduction medal
      list.push({
        id: beadId++, type: 'sorrow', label: `2. Sorrow ${s+1} - Meditation & Our Father`, prayerName: `The ${s+1} Sorrow`,
        prayerTextEn: prayersTemplates.ourFather.en,
        prayerTextSw: prayersTemplates.ourFather.sw,
        mysteryTextEn: sorrow.en + '\n\n' + sorrow.descEn + '\n\nSali Baba Yetu 1.',
        mysteryTextSw: sorrow.sw + '\n\n' + sorrow.descSw + '\n\nSali Baba Yetu 1.',
        x: Math.round(200 + 115 * Math.cos(baseAngle)),
        y: Math.round(150 + 80 * Math.sin(baseAngle))
      });

      // 7 Hail Marys
      for (let h = 0; h < 7; h++) {
        const hmAngle = baseAngle + 0.12 + (h * 0.08);
        list.push({
          id: beadId++, type: 'hail-mary', label: `3. Sorrow ${s+1} - Hail Mary ${h+1}`, prayerName: prayersTemplates.hailMary.nameEn,
          prayerTextEn: prayersTemplates.hailMary.en, prayerTextSw: prayersTemplates.hailMary.sw,
          mysteryTextEn: `Sorrow ${s+1} • Hail Mary ${h+1} of 7`,
          mysteryTextSw: `Huzuni ya ${s+1} • Salamu Maria ${h+1} ya 7`,
          x: Math.round(200 + 115 * Math.cos(hmAngle)),
          y: Math.round(150 + 80 * Math.sin(hmAngle))
        });
      }
    }

    // Closing (Center piece)
    list.push({
      id: beadId++, type: 'conclusion', label: '4. Concluding Prayer', prayerName: 'Concluding Intercession',
      prayerTextEn: 'Queen of Martyrs, your heart was so deeply pierced... Pray for us that we may share in your virtues.',
      prayerTextSw: 'Malkia wa Mashahidi, moyo wako ulichomwa sana... Utuombee ili tushiriki fadhila zako. Amina.',
      mysteryTextEn: 'Sali Hail Marys 3 in honor of Mary’s tears, followed by the closing prayer.',
      mysteryTextSw: 'Sali Salamu Maria 3 kwa heshima ya machozi ya Mama Maria, kisha sala ya kuhitimisha.',
      x: 200, y: 235
    });

    return list;
  };

  const beads = selectedRosary === 'marian'
    ? buildMarianBeads()
    : selectedRosary === 'stmichael'
    ? buildStMichaelBeads()
    : buildSevenSorrowsBeads();

  const currentBead = beads[currentBeadIndex] || beads[0];

  const handleNextBead = () => {
    if (currentBeadIndex < beads.length - 1) {
      setCurrentBeadIndex(currentBeadIndex + 1);
    } else {
      setCurrentBeadIndex(0);
    }
  };

  const handlePrevBead = () => {
    if (currentBeadIndex > 0) {
      setCurrentBeadIndex(currentBeadIndex - 1);
    }
  };

  const selectRosaryType = (type: 'marian' | 'stmichael' | 'sevensorrows') => {
    setSelectedRosary(type);
    setCurrentBeadIndex(0);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-16 max-w-6xl mx-auto px-1">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Devotion & Spiritual Life
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          How to Pray the Rosary
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          An interactive, visual step-by-step guide to praying the Holy Rosary, Chaplet of St. Michael, and Rosary of the Seven Sorrows.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 max-w-md mx-auto justify-around bg-muted/30 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('rosary')}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'rosary' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visual Rosary Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pdfs' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF Prayer Books</span>
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'rosary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Rosary Selectors (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-foreground">Select Devotional</h3>
              <div className="space-y-2">
                <button
                  onClick={() => selectRosaryType('marian')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex flex-col gap-1 transition-all ${
                    selectedRosary === 'marian'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <span className="font-extrabold text-foreground text-xs">Holy Rosary (Dominican)</span>
                  <span>5 Decades. Meditations on the life of Christ.</span>
                </button>
                <button
                  onClick={() => selectRosaryType('stmichael')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex flex-col gap-1 transition-all ${
                    selectedRosary === 'stmichael'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <span className="font-extrabold text-foreground text-xs">Chaplet of St. Michael</span>
                  <span>9 Salutations to the 9 Angel Choirs.</span>
                </button>
                <button
                  onClick={() => selectRosaryType('sevensorrows')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex flex-col gap-1 transition-all ${
                    selectedRosary === 'sevensorrows'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <span className="font-extrabold text-foreground text-xs">Rosary of Seven Sorrows</span>
                  <span>7 Meditations on Our Lady of Sorrows.</span>
                </button>
              </div>

              {selectedRosary === 'marian' && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Mysteries</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['joyful', 'luminous', 'sorrowful', 'glorious'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedMysteryGroup(g)}
                        className={`py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                          selectedMysteryGroup === g
                            ? 'bg-primary text-white border-primary'
                            : 'border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: The Direct Visual Bead Map (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col items-center">
            <h3 className="font-extrabold text-sm text-foreground text-center border-b border-border/80 pb-2 w-full">
              Rosary Bead Map
            </h3>
            
            {/* SVG Interactive Diagram */}
            <div className="relative w-full aspect-[400/480] max-w-[340px] mt-4 flex items-center justify-center bg-muted/10 rounded-xl border border-border/40 p-2">
              <svg
                viewBox="0 0 400 480"
                className="w-full h-full select-none"
              >
                {/* Connecting Chains / Loops */}
                <ellipse
                  cx="200"
                  cy="150"
                  rx="115"
                  ry="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border/60"
                />
                <line
                  x1="200"
                  y1="230"
                  x2="200"
                  y2="440"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-border/60"
                />

                {/* Render Beads */}
                {beads.map((b, idx) => {
                  const isActive = idx === currentBeadIndex;
                  const isCrucifix = b.type === 'creed';
                  const isConclusion = b.type === 'conclusion';
                  const isOurFather = b.type === 'our-father' || b.type === 'sorrow' || b.type === 'salutation';

                  let radius = 7;
                  let fill = '#a3a3a3'; // Default gray
                  let stroke = '#737373';
                  let strokeWidth = 1.5;

                  if (isCrucifix) {
                    radius = 12;
                    fill = '#ef4444'; // Red for Crucifix
                    stroke = '#b91c1c';
                  } else if (isConclusion) {
                    radius = 11;
                    fill = '#fbbf24'; // Gold Medal
                    stroke = '#d97706';
                  } else if (isOurFather) {
                    radius = 9;
                    fill = '#f59e0b'; // Amber
                    stroke = '#b45309';
                  } else {
                    fill = '#a78bfa'; // Purple for Hail Mary
                    stroke = '#6d28d9';
                  }

                  if (isActive) {
                    fill = '#16a34a'; // Vibrant Green for Active Bead
                    stroke = '#15803d';
                    radius += 3;
                    strokeWidth = 2.5;
                  }

                  if (isCrucifix) {
                    // Draw a visual Cross instead of a circle
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setCurrentBeadIndex(idx)}
                      >
                        {/* Horizontal Crossbar */}
                        <rect
                          x={b.x - 14}
                          y={b.y - 4}
                          width="28"
                          height="8"
                          rx="2"
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                        />
                        {/* Vertical Crossbar */}
                        <rect
                          x={b.x - 4}
                          y={b.y - 20}
                          width="8"
                          height="36"
                          rx="2"
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                        />
                        {/* Glowing Active Ring */}
                        {isActive && (
                          <circle
                            cx={b.x}
                            cy={b.y}
                            r="22"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                        )}
                      </g>
                    );
                  }

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => setCurrentBeadIndex(idx)}
                    >
                      {/* Outer Glow for Active Bead */}
                      {isActive && (
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r={radius + 6}
                          fill="rgba(34, 197, 94, 0.15)"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Bead Node */}
                      <circle
                        cx={b.x}
                        cy={b.y}
                        r={radius}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        className="transition-all hover:scale-125"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Guide Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold text-muted-foreground w-full border-t border-border/60 pt-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded border border-red-700 block shrink-0" />
                <span>Crucifix (Start / Creed)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded border border-amber-700 block shrink-0" />
                <span>Large Bead (Our Father)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-purple-400 rounded border border-purple-600 block shrink-0" />
                <span>Small Bead (Hail Mary)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded border border-emerald-700 block shrink-0" />
                <span>Active Bead Indicator</span>
              </div>
            </div>
          </div>

          {/* Column 3: Step Details & Script (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Guide Step Script */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              
              {/* Header Info */}
              <div className="bg-muted/40 p-4 border-b border-border/80 flex justify-between items-center">
                <div>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                    Step {currentBeadIndex + 1} of {beads.length}
                  </span>
                  <h4 className="font-black text-sm text-foreground mt-1 leading-snug">{currentBead.label}</h4>
                </div>

                <div className="flex bg-muted rounded-lg p-0.5 border border-border">
                  <button
                    onClick={() => setRosaryLanguage('english')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      rosaryLanguage === 'english' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setRosaryLanguage('swahili')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      rosaryLanguage === 'swahili' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Kiswahili
                  </button>
                </div>
              </div>

              {/* Meditation Text / Mystery */}
              {(currentBead.mysteryTextEn || currentBead.mysteryTextSw) && (
                <div className="p-4 bg-primary/5 border-b border-border/60 text-xs text-foreground/90 space-y-1.5">
                  <h5 className="font-black text-[9px] uppercase text-primary tracking-widest">Meditation & Mystery</h5>
                  <p className="leading-relaxed whitespace-pre-line font-medium text-foreground/80">
                    {rosaryLanguage === 'english' ? currentBead.mysteryTextEn : currentBead.mysteryTextSw}
                  </p>
                </div>
              )}

              {/* Active Prayer Text */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center space-y-4 min-h-[220px]">
                <h3 className="font-extrabold text-base text-primary border-b border-primary/10 pb-1 w-fit">
                  {rosaryLanguage === 'english' ? currentBead.prayerName : (selectedRosary === 'marian' ? prayersTemplates[currentBead.type as keyof typeof prayersTemplates]?.nameSw || currentBead.prayerName : currentBead.prayerName)}
                </h3>
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line italic font-serif">
                  {rosaryLanguage === 'english' ? currentBead.prayerTextEn : currentBead.prayerTextSw}
                </p>
              </div>

              {/* Navigation Footer */}
              <div className="p-4 border-t border-border flex justify-between items-center bg-muted/20">
                <button
                  onClick={handlePrevBead}
                  disabled={currentBeadIndex === 0}
                  className="touch-target px-4 py-2 bg-muted hover:bg-border disabled:opacity-40 text-xs font-bold text-foreground/80 rounded-xl transition-all flex items-center space-x-1 border"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextBead}
                  className="touch-target px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shadow-md shadow-primary/15"
                >
                  <span>{currentBeadIndex === beads.length - 1 ? 'Start Over' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Decade Tracker bar */}
            <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <span className="text-xs font-black text-foreground">Decade Guide</span>
              <div className="flex items-center space-x-1 bg-muted px-2.5 py-1 rounded-xl border border-border/80 text-[10px] font-bold">
                <span>Progress:</span>
                <span className="text-primary font-black">{Math.floor((currentBeadIndex / (beads.length - 1)) * 100)}%</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'pdfs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pdfResources.map((pdf, idx) => (
            <div key={idx} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-extrabold text-sm text-foreground">{pdf.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pdf.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground">Size: {pdf.size}</span>
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
