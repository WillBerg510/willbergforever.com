import { motion } from 'motion/react';
import '../stylesheets/About.css';
import { useState, useRef, useEffect } from 'react';

const About = (props) => {
  const [hasTopFade, setHasTopFade] = useState(false);
  const [hasBottomFade, setHasBottomFade] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const aboutRef = useRef(null);

  useEffect(() => {
    const about = aboutRef.current;
    if (!about) return;

    const updateFadeState = () => {
      setHasTopFade(about.scrollTop > 0);
      setHasBottomFade(about.scrollTop + about.clientHeight < about.scrollHeight - 1);
    };

    updateFadeState();
    about.addEventListener('scroll', updateFadeState);
    const resizeObserver = new ResizeObserver(updateFadeState);
    resizeObserver.observe(about);

    return () => {
      about.removeEventListener('scroll', updateFadeState);
      resizeObserver.disconnect();
    };
  }, [readMore]);

  const openReadMore = () => {
    setReadMore(true);
  }

  return (
    <motion.div
      className={`about${hasTopFade ? ' hasTopFade' : ''}${hasBottomFade ? ' hasBottomFade' : ''}`}
      ref={aboutRef}
      initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeInOut", delay: 0.15 } }}
			exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
    >
      <h1 className="aboutHeading">ABOUT ME</h1>
      <p className="aboutText">
        Hello, and welcome to this website! My name's Will Berg, a fourth-year computer science student at the University of Florida. I'm an avid creator of personal projects in my free time, having made a wide variety of projects ranging from animated cartoons and digital artwork to original music and cover songs. This website is simply another entry in my long catalog of creations, covering my need to HAVE a catalog of my creations! There's plenty of stuff to explore here, so I hope you stay a while to look through projects, read their newly-written descriptions, enjoy viewing them, and react with emojis.
      </p>
      {!readMore && <div className="aboutReadMoreButton" onClick={openReadMore}>
        READ MORE
      </div>}
      {readMore && <div className="aboutReadMore">
        <p className="aboutText">
          At the University of Florida, I've been involved with the student organizations of SEC (Software Engineering Club) and AASU (Asian American Student Union). In SEC, I've been a part of their dev team for three years, having taken the roles of Developer, Team Lead, and now Head of Product. In AASU, I was the webmaster for two years, working to build the organization's new website from the ground up while also helping out with general board member duties. I have also worked as a research assistant with Caltech's Community Seismic Network (CSN), interned at BellaMia Technologies, Inc., and worked as a software intern at UCF's College of Optics & Photonics (CREOL). Through my experiences and classes, I've learned full-stack development with tools like React, Node.js, MongoDB, Express, Git, GitHub Copilot, and Supabase. I'm also experienced with AWS S3, Netlify, Render, Electron, C/C++, Python, JavaScript, HTML/CSS, and R.
        </p>
        <p className="aboutText">
          My free time has seen me take on many different mediums for projects across the years. Initially an animator and game creator on Scratch, I would eventually start creating high-quality cartoons in Adobe Animate and posting them on YouTube. Those earlier years culminated in a Roblox game called "Treasure Hunt: Let's Get Digging!" and a YouTube cartoon called "Lunacy Today: Day 2". All this time, I was also making digital music in LMMS; in more recent years, music has become the core of my personal creations. With an electric guitar, a vocal mic, and FL Studio, I've been making song covers and original music to produce my own version of the 2000's pop-punk sound. Check out "Water Bottle Pile", "19", and my cover of My Chemical Romance's "Helena" as some of my best work in that area. Right now, I'm in preparation for a new era of original music, so be sure to stay tuned to my YouTube and Spotify/Apple Music pages! Awesome stuff is on the horizon.
        </p>
      </div>}
    </motion.div>
  )
}

export default About;