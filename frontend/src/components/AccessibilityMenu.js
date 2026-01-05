import React, { useState, useEffect } from 'react';
import { FaUniversalAccess, FaTextHeight, FaPalette, FaAdjust, FaKeyboard } from 'react-icons/fa';
import '../styles/AccessibilityMenu.css';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    colorBlind: 'none',
    reduceMotion: false,
    keyboardNav: false
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings) => {
    const root = document.documentElement;

    // Font size
    const fontSizes = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.fontSize = fontSizes[newSettings.fontSize];

    // Contrast
    if (newSettings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Color blind modes
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (newSettings.colorBlind !== 'none') {
      root.classList.add(newSettings.colorBlind);
    }

    // Reduce motion
    if (newSettings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Keyboard navigation
    if (newSettings.keyboardNav) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }

    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 'normal',
      contrast: 'normal',
      colorBlind: 'none',
      reduceMotion: false,
      keyboardNav: false
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Options"
        title="Accessibility Options"
      >
        <FaUniversalAccess />
      </button>

      {/* Accessibility Menu */}
      {isOpen && (
        <div className="accessibility-menu" role="dialog" aria-label="Accessibility Settings">
          <div className="accessibility-header">
            <h2>Accessibility Options</h2>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility menu"
            >
              ×
            </button>
          </div>

          <div className="accessibility-content">
            {/* Font Size */}
            <div className="setting-group">
              <label>
                <FaTextHeight /> Font Size
              </label>
              <div className="setting-options">
                {['small', 'normal', 'large', 'xlarge'].map((size) => (
                  <button
                    key={size}
                    className={`option-btn ${settings.fontSize === size ? 'active' : ''}`}
                    onClick={() => updateSetting('fontSize', size)}
                  >
                    {size === 'small' && 'A'}
                    {size === 'normal' && 'A'}
                    {size === 'large' && 'A'}
                    {size === 'xlarge' && 'A'}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast */}
            <div className="setting-group">
              <label>
                <FaAdjust /> Contrast
              </label>
              <div className="setting-options">
                <button
                  className={`option-btn ${settings.contrast === 'normal' ? 'active' : ''}`}
                  onClick={() => updateSetting('contrast', 'normal')}
                >
                  Normal
                </button>
                <button
                  className={`option-btn ${settings.contrast === 'high' ? 'active' : ''}`}
                  onClick={() => updateSetting('contrast', 'high')}
                >
                  High
                </button>
              </div>
            </div>

            {/* Color Blind Mode */}
            <div className="setting-group">
              <label>
                <FaPalette /> Color Blind Mode
              </label>
              <select
                value={settings.colorBlind}
                onChange={(e) => updateSetting('colorBlind', e.target.value)}
                className="setting-select"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              </select>
            </div>

            {/* Reduce Motion */}
            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                />
                <span>Reduce Motion</span>
              </label>
              <p className="setting-description">
                Minimize animations and transitions
              </p>
            </div>

            {/* Keyboard Navigation */}
            <div className="setting-group">
              <label className="checkbox-label">
                <FaKeyboard />
                <input
                  type="checkbox"
                  checked={settings.keyboardNav}
                  onChange={(e) => updateSetting('keyboardNav', e.target.checked)}
                />
                <span>Enhanced Keyboard Navigation</span>
              </label>
              <p className="setting-description">
                Show focus indicators for keyboard users
              </p>
            </div>

            {/* Reset Button */}
            <button className="reset-btn" onClick={resetSettings}>
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="accessibility-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilityMenu;
