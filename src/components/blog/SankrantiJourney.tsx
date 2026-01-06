import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './SankrantiJourney.css';

gsap.registerPlugin(ScrollTrigger);

const SankrantiJourney: React.FC = () => {
    const [lang, setLang] = useState<'en' | 'te'>('en');

    useEffect(() => {
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
        });

        // GSAP Timeline Progress Animation
        const progressLine = document.querySelector('.sj-timeline-progress');
        if (progressLine) {
            gsap.to(progressLine, {
                height: '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: '.sj-journey-section',
                    start: 'top 20%',
                    end: 'bottom bottom',
                    scrub: 1,
                },
            });
        }

        // Refresh AOS on language change as content height might change
        AOS.refresh();
    }, [lang]);

    const setLanguage = (newLang: 'en' | 'te') => {
        setLang(newLang);
    };

    return (
        <div className="sankranti-journey-root" data-lang={lang}>
            {/* Language Toggle */}
            <div className="sj-lang-toggle-container">
                <button
                    className={`sj-lang-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                >
                    English
                </button>
                <button
                    className={`sj-lang-btn ${lang === 'te' ? 'active' : ''}`}
                    onClick={() => setLanguage('te')}
                >
                    తెలుగు
                </button>
            </div>

            {/* Hero Section */}
            <header className="sj-hero">
                <div className="sj-hero-bg"></div>
                <div className="sj-hero-content">
                    <p data-aos="fade-down">
                        {lang === 'en' ? 'Sanskara AI Presents' : 'సంస్కార AI సమర్పించు'}
                    </p>
                    <h1 data-aos="zoom-out" data-aos-delay="200">
                        {lang === 'en' ? 'The Sankranti Journey' : 'సంక్రాంతి ప్రయాణం'}
                    </h1>
                    <p data-aos="fade-up" data-aos-delay="400">
                        {lang === 'en'
                            ? '"We traditionally make things easy for you."'
                            : '"మేము సాంప్రదాయబద్ధంగా పనులను మీకు సులభతరం చేస్తాము."'}
                    </p>
                    <a href="https://chat.whatsapp.com/LK7rUdiK0vtJQW6ZB2iKlM" className="sj-cta-button" data-aos="fade-up" data-aos-delay="600">
                        {lang === 'en' ? 'Pre-Order Your Kit (Hyderabad Exclusive)' : 'మీ కిట్‌ను ప్రీ-ఆర్డర్ చేయండి (హైదరాబాద్ ప్రత్యేకం)'}
                    </a>
                </div>
                <div className="sj-scroll-hint">
                    <p>
                        {lang === 'en' ? 'Experience the Tradition' : 'సంప్రదాయాన్ని అనుభవించండి'}
                    </p>
                    <div className="sj-arrow-bounce">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                        </svg>
                    </div>
                </div>
            </header>

            {/* The Journey Timeline */}
            <section className="sj-journey-section" id="journey">
                <div className="sj-timeline-container">
                    <div className="sj-timeline-line"></div>
                    <div className="sj-timeline-progress"></div>

                    {/* Day 1: Bhogi */}
                    <div className="sj-stop">
                        <div className="sj-timeline-bubble"></div>
                        <div className="sj-stop-visual" data-aos="fade-right">
                            <img src="/assets/blog/sankranti-journey/bhogi_fire.png" alt="Bhogi Mantalu" />
                        </div>
                        <div className="sj-stop-content" data-aos="fade-left">
                            <span className="sj-stop-tag">
                                {lang === 'en' ? 'Day 1: Bhogi' : '1వ రోజు: భోగి'}
                            </span>
                            <h2>
                                {lang === 'en' ? 'The Cleansing' : 'శుద్ధీకరణ'}
                            </h2>
                            <div className="sj-significance">
                                {lang === 'en'
                                    ? '"We burn the old to make way for the new. It represents the destruction of bad habits and a spiritual reset."'
                                    : '"పాత వాటిని తగులబెట్టి కొత్త వాటికి దారి చూపుతాం. ఇది చెడు అలవాట్ల వినాశనాన్ని, కొత్త ప్రారంభాన్ని సూచిస్తుంది."'}
                            </div>
                            <p>
                                {lang === 'en'
                                    ? <>As the sun begins to rise, the village echoes with the crackle of <strong>Bhogi Mantalu</strong>. It's a time to let go—physically and metaphorically.</>
                                    : <>సూర్యుడు ఉదయించగానే, గ్రామం <strong>భోగి మంటల</strong> చప్పుళ్లతో మారుమోగుతుంది. ఇది వదిలిపెట్టే సమయం—భౌతికమైనా మరియు మానసికమైనా.</>}
                            </p>

                            <div className="sj-ritual-box">
                                <h4>{lang === 'en' ? 'The Ritual' : 'ఆచారం'}</h4>
                                <p>
                                    {lang === 'en'
                                        ? 'Bathe with sesame oil to strengthen the body for winter. Light the bonfire with sacred Pidakalu and old belongings. Decorate your doorstep with intricate Muggulu to welcome auspiciousness.'
                                        : 'శీతాకాలం కోసం శరీరాన్ని బలోపేతం చేయడానికి నువ్వుల నూనెతో స్నానం చేయండి. పవిత్రమైన పిడకలు మరియు పాత వస్తువులతో భోగి మంటలు వెలిగించండి. శుభప్రదమైన ప్రారంభం కోసం ఇంటి ముందర అందమైన ముగ్గులతో అలంకరించండి.'}
                                </p>
                            </div>

                            <div className="sj-product-tie">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--deep-orange)">
                                    <path d="M12 2C12 2 7 8 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 8 12 2 12 2Z" />
                                </svg>
                                <div>
                                    <strong>{lang === 'en' ? 'Kit Inclusion:' : 'కిట్ లో ఉన్నాయి:'}</strong> {lang === 'en' ? '5 Organic Bhogi Pidakalu & Vibrant Muggu Colours.' : '5 సేంద్రీయ భోగి పిడకలు & ముగ్గు రంగులు.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day 2: Sankranti */}
                    <div className="sj-stop">
                        <div className="sj-timeline-bubble"></div>
                        <div className="sj-stop-visual" data-aos="fade-left">
                            <img src="/assets/blog/sankranti-journey/sankranti_pot.png" alt="Sankranti Pongal" />
                        </div>
                        <div className="sj-stop-content" data-aos="fade-right">
                            <span className="sj-stop-tag">
                                {lang === 'en' ? 'Day 2: Makara Sankranti' : '2వ రోజు: మకర సంక్రాంతి'}
                            </span>
                            <h2>
                                {lang === 'en' ? 'The Harvest' : 'పంట పండుగ'}
                            </h2>
                            <div className="sj-significance">
                                {lang === 'en'
                                    ? '"Surya Narayana enters Makara Rashi. A day of profound gratitude to the Sun, the source of all life."'
                                    : '"సూర్య నారాయణుడు మకర రాశిలోకి ప్రవేశిస్తాడు. సమస్త జీవకోటికి ఆధారమైన సూర్యుడికి కృతజ్ఞతలు తెలిపే రోజు."'}
                            </div>
                            <p>
                                {lang === 'en'
                                    ? 'The main festival day! The aroma of jaggery and new rice fills the air as families gather for the most auspicious time of the year.'
                                    : 'ముఖ్యమైన పండుగ రోజు! బెల్లం మరియు కొత్త బియ్యం పరిమళం గాలిలో నిండిపోతుంటే, కుటుంబ సభ్యులందరూ కలిసి వేడుక జరుపుకుంటారు.'}
                            </p>

                            <div className="sj-ritual-box">
                                <h4>{lang === 'en' ? "Mother's Wisdom" : 'అమ్మ చెప్పిన మాట'}</h4>
                                <p>
                                    {lang === 'en'
                                        ? <>Cook Pongal in a new clay pot until it overflows—a symbol of abundance. For children, perform the <strong>Bhogi Pallu</strong> ceremony, pouring Regi Pallu, coins, and flowers to ward off evil and bless their growth.</>
                                        : <>కొత్త మట్టి పాత్రలో పొంగలి పొంగేలా వండండి—ఇది సమృద్ధికి చిహ్నం. పిల్లల కోసం, దిష్టి తగలకుండా మరియు వారి అభివృద్ధి కోసం రేగి పళ్లు, నాణేలు, పువ్వులతో <strong>భోగి పళ్లు</strong> పోయండి.</>}
                                </p>
                            </div>

                            <div className="sj-product-tie">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--deep-orange)">
                                    <path d="M12 3L4 9V21H20V9L12 3Z" />
                                </svg>
                                <div>
                                    <strong>{lang === 'en' ? 'Kit Inclusion:' : 'కిట్ లో ఉన్నాయి:'}</strong> {lang === 'en' ? 'Traditional Clay Pot, Regi Pallu, & Sacred Coins.' : 'సాంప్రదాయ మట్టి పాత్ర, రేగి పళ్లు, & పూజా నాణేలు.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day 3: Kanuma */}
                    <div className="sj-stop">
                        <div className="sj-timeline-bubble"></div>
                        <div className="sj-stop-visual" data-aos="fade-right">
                            <img src="/assets/blog/sankranti-journey/kanuma_kites.png" alt="Kanuma Kites" />
                        </div>
                        <div className="sj-stop-content" data-aos="fade-left">
                            <span className="sj-stop-tag">
                                {lang === 'en' ? 'Day 3: Kanuma' : '3వ రోజు: కనుమ'}
                            </span>
                            <h2>
                                {lang === 'en' ? 'The Celebration' : 'వేడుక'}
                            </h2>
                            <div className="sj-significance">
                                {lang === 'en'
                                    ? '"Honoring the cattle that toil for our food. And for the soul? It\'s time to let the spirit soar high!"'
                                    : '"ఆహారం కోసం కష్టపడే పశువులను గౌరవించడం. ఇక ఆనందం కోసం... గాలిపటాలను ఆకాశంలోకి ఎగురవేద్దాం!"'}
                            </div>
                            <p>
                                {lang === 'en'
                                    ? 'While the first two days are about prayer and cleansing, Kanuma is about joy, bonding, and honoring our animal companions.'
                                    : 'మొదటి రెండు రోజులు ప్రార్థన మరియు శుద్ధీకరణ గురించి అయితే, కనుమ ఆనందం, బంధాలు మరియు పశువులను గౌరవించే రోజు.'}
                            </p>

                            <div className="sj-ritual-box">
                                <h4>{lang === 'en' ? 'Ritual & Joy' : 'ఆచారం & ఆనందం'}</h4>
                                <p>
                                    {lang === 'en'
                                        ? 'Perform Go Pooja for the cattle. In the city, visit a temple or feed a cow. Then, head to the terrace! The sky turns into a battlefield of colors.'
                                        : 'పశువుల కోసం గోపూజ చేయండి. నగరంలో అయితే, దేవాలయాన్ని సందర్శించండి లేదా ఆవుకు ఆహారం తినిపించండి. ఆపై మిద్దెపైకి వెళ్లండి! ఆకాశం రంగుల మయంగా మారుతుంది.'}
                                </p>
                            </div>

                            <div className="sj-product-tie">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--deep-orange)">
                                    <path d="M14.5 2L12 7L9.5 2L12 4.5L14.5 2Z M12 7V22" />
                                </svg>
                                <div>
                                    <strong>{lang === 'en' ? 'Kit Inclusion:' : 'కిట్ లో ఉన్నాయి:'}</strong> {lang === 'en' ? 'Pro-grade Kites, Cotton Manja, & Repair Tape.' : 'గాలిపటాలు, కాటన్ మంజా, & రిపేర్ టేప్.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mother's Wisdom Sidepiece */}
                    <div className="sj-stop">
                        <div className="sj-stop-visual" data-aos="zoom-in">
                            <img src="/assets/blog/sankranti-journey/mothers_wisdom.png" alt="Mother's Wisdom" />
                        </div>
                        <div className="sj-stop-content" style={{ background: '#FFF5E6', borderColor: '#D4AF37' }} data-aos="fade-up">
                            <h2 style={{ fontSize: '1.8rem' }}>
                                {lang === 'en' ? 'The Science in Tradition' : 'సంప్రదాయం వెనుక విజ్ఞానం'}
                            </h2>
                            <p>
                                {lang === 'en'
                                    ? <>Ever wondered why we use <strong>Sesame (Nuvvulu)</strong>? Mother explains: "It's peak winter. Sesame generates natural body heat and provides essential oils and minerals to strengthen bones for the coming months."</>
                                    : <>మనం <strong>నువ్వులు</strong> ఎందుకు వాడతామో ఎప్పుడైనా ఆలోచించారా? అమ్మ ఇలా చెబుతుంది: "ఇది తీవ్రమైన శీతాకాలం. నువ్వులు శరీరంలో వేడిని ఉత్పత్తి చేస్తాయి మరియు ఎముకలను దృఢంగా చేయడానికి అవసరమైన నూనెలు మరియు ఖనిజాలను అందిస్తాయి."</>}
                            </p>
                            <p style={{ marginTop: '10px' }}>
                                {lang === 'en'
                                    ? 'Our kit follows these ancient blueprints exactly as they were meant to be.'
                                    : 'మా కిట్ ఈ ప్రాచీన పద్ధతులను యథాతథంగా అనుసరిస్తుంది.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kit Showcase */}
            <section className="sj-kit-section">
                <div className="sj-section-header">
                    <h2 data-aos="fade-up">
                        {lang === 'en' ? 'The Sampradaya Kit' : 'సంప్రదాయ కిట్'}
                    </h2>
                    <p data-aos="fade-up" data-aos-delay="200">
                        {lang === 'en'
                            ? 'Everything you need for all 3 days. Carefully curated for urban families.'
                            : '3 రోజుల పండుగకు కావలసినవన్నీ ఒకే కిట్ లో. నగర వాసుల కోసం ప్రత్యేకంగా రూపొందించబడింది.'}
                    </p>
                </div>

                <div className="sj-kit-main-visual" data-aos="zoom-in">
                    <img src="/assets/blog/sankranti-journey/kit_full.jpg" alt="Sankranthi Sampradaya Kit Breakdown" />
                </div>

                <div className="sj-kit-grid">
                    <div className="sj-kit-item" data-aos="fade-up">
                        <h3>{lang === 'en' ? 'The Essentials' : 'ముఖ్యమైనవి'}</h3>
                        <p>{lang === 'en' ? 'Bhogi Pidakalu, Navadanyalu, Sugar Chilakalu.' : 'భోగి పిడకలు, నవధాన్యాలు, చక్కెర చిలకలు.'}</p>
                    </div>
                    <div className="sj-kit-item" data-aos="fade-up" data-aos-delay="100">
                        <h3>{lang === 'en' ? 'The Art' : 'కళాకృతులు'}</h3>
                        <p>{lang === 'en' ? 'Muggu Board & 5 Organic Colours.' : 'ముగ్గు బోర్డు & 5 సహజ సిద్ధమైన రంగులు.'}</p>
                    </div>
                    <div className="sj-kit-item" data-aos="fade-up" data-aos-delay="200">
                        <h3>{lang === 'en' ? 'The Ritual' : 'ఆచారం'}</h3>
                        <p>{lang === 'en' ? 'Clay Pot, Regi Pallu, Coins, Sugarcane.' : 'మట్టి పాత్ర, రేగి పళ్లు, నాణేలు, చెరకు.'}</p>
                    </div>
                    <div className="sj-kit-item" data-aos="fade-up" data-aos-delay="300">
                        <h3>{lang === 'en' ? 'The Fun' : 'వినోదం'}</h3>
                        <p>{lang === 'en' ? 'Kites, Cotton Manja, Wooden Sticks.' : 'గాలిపటాలు, కాటన్ మంజా, చెక్క కర్రలు.'}</p>
                    </div>
                </div>

                <div className="sj-price-tag" data-aos="pulse">
                    ₹699
                </div>
            </section>

            {/* Footer / Action */}
            <footer className="sj-footer-cta">
                <h2 data-aos="fade-up">
                    {lang === 'en' ? 'Limited Stocks Available' : 'పరిమిత స్టాక్ మాత్రమే ఉంది'}
                </h2>
                <p className="sj-urgency" data-aos="fade-up" data-aos-delay="200">
                    {lang === 'en' ? 'Pre-Orders Close: Jan 11th, 11:59 PM' : 'ప్రీ-ఆర్డర్లు ముగింపు: జనవరి 11, 11:59 PM'}
                </p>
                <a href="https://chat.whatsapp.com/LK7rUdiK0vtJQW6ZB2iKlM" className="sj-whatsapp-cta-large" data-aos="zoom-in">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-2.32 0-4.591.905-6.23 2.544a8.774 8.774 0 0 0-2.544 6.23c0 1.942.507 3.84 1.47 5.514L3.43 23l2.613-1.072a8.75 8.75 0 0 0 5.988 1.458c4.852 0 8.791-3.939 8.791-8.791 0-2.32-.905-4.591-2.544-6.23a8.774 8.774 0 0 0-6.23-2.544z" />
                    </svg>
                    <span>{lang === 'en' ? 'Join WhatsApp Group to Order' : 'ఆర్డర్ చేయడానికి వాట్సాప్ గ్రూపులో చేరండి'}</span>
                </a>
                <div className="sj-upi-info">
                    UPI ID: <strong>9642337777@ybl</strong>
                </div>
            </footer>
        </div>
    );
};

export default SankrantiJourney;
