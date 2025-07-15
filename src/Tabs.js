import React, { useState, useRef, useEffect } from 'react';
import './Tabs.css';

const Tabs = () => {
  const tabs = ['Hate Speech', 'Fake News', 'Something Else'];
  const [activeIndex, setActiveIndex] = useState(0);
  const navRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    const line = lineRef.current;
    const activeTab = nav.querySelector('li.active');

    if (activeTab && line) {
      const tabOffset = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      line.style.left = `${tabOffset}px`;
      line.style.width = `${tabWidth}px`;
    }
  }, [activeIndex]);

  return (
    <div className="tab-nav-wrapper">
      <nav ref={navRef}>
        <ul>
          {tabs.map((tab, index) => (
            <li
              key={index}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => setActiveIndex(index)}
            >
              <a href="#">{tab}</a>
            </li>
          ))}
        </ul>
        <div className="line" ref={lineRef}></div>
      </nav>

      {/* Tab Content */}
      <div style={{ color: 'white', marginTop: '20px', fontFamily: 'Lato' }}>
        {activeIndex === 0 && <div><h2>Hate Speech Detector</h2><p>Enter or classify hate speech content here.</p></div>}
        {activeIndex === 1 && <div><h2>Fake News Detector</h2><p>Paste an article or headline to check for misinformation.</p></div>}
        {activeIndex === 2 && <div><h2>Coming Soon</h2><p>More features to be added.</p></div>}
      </div>
    </div>
  );
};

export default Tabs;
