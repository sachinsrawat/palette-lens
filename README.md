# PaletteLens 🎨

A browser-based colour accessibility checker that helps designers and developers create more inclusive colour palettes by simulating different types of colour blindness, identifying visually confusing colours, and checking text contrast against WCAG accessibility standards.

## 🌐 Live Demo

https://sachinsrawat.github.io/palettelens/

## ✨ Features

- **Custom Colour Palette:** Select and customize a palette of five different colours.
- **Colour Blindness Simulation:** Preview colours under typical colour vision, protanopia, deuteranopia, and tritanopia.
- **Confusing Colour Detection:** Identify colour combinations that may be difficult to distinguish for people with different types of colour blindness.
- **WCAG Contrast Checker:** Calculate the contrast ratio between selected text and background colours.
- **Accessibility Evaluation:** Check contrast against WCAG AA, AA Large Text, and AAA requirements.
- **Random Palette Generator:** Generate random colour combinations to explore different palettes.
- **Copy CSS Variables:** Copy selected colours as reusable CSS custom properties.
- **Shareable Palettes:** Share colour palettes through URL hash parameters.
- **Browser-Based Processing:** All colour calculations happen directly in the browser without uploading palette data to a server.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- DOM Manipulation
- WCAG Contrast Ratio Calculations
- CIE Lab Colour Difference (Delta E)
- Browser Clipboard API
- Local Browser URL Hash Parameters

## 🚀 How to Run Locally

1. Clone this repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Open the project folder in Visual Studio Code.
3. Open `index.html` in your browser, or use the Live Server extension.
4. Select colours and explore their accessibility results.

## 📁 Project Structure

```text
palettelens/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🎯 Project Purpose

PaletteLens aims to make colour accessibility easier to understand and evaluate during web design and development. It helps users identify potentially inaccessible colour combinations and make more informed decisions when choosing colours for digital interfaces.

The project demonstrates practical front-end development skills, including DOM manipulation, event handling, colour conversion algorithms, accessibility calculations, dynamic UI updates, and browser API integration.

---

Developed as a front-end web development project.
