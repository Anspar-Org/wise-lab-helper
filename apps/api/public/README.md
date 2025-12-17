# Spelling Practice Web App

A simple, kid-friendly web application for practicing spelling words with AI-generated voice.

## Features

- **Word List Input**: Enter any list of words (one per line)
- **Random Order**: Words are automatically shuffled for practice
- **Text-to-Speech**: Uses browser's built-in Web Speech API to read words aloud
- **Reveal Button**: Click to check your spelling
- **No Answer Recording**: Students check their own answers (no speech-to-text needed)
- **Kid-Friendly Design**: Large buttons, clear interface, colorful design

## How to Use

### For Students

1. **Access the App**: Open your web browser and go to:
   ```
   http://localhost:3001/apps/spelling-practice.html
   ```
   (Replace `localhost` with your server's IP address if accessing from another device)

2. **Enter Your Words**: Type your spelling words, one per line, in the text box

3. **Start Practice**: Click the "Start Practice" button

4. **Listen & Spell**:
   - The app will automatically speak the first word
   - Click "🔊 Speak Word" to hear it again
   - Try to spell the word (on paper or in your head)

5. **Check Your Answer**: Click "👁️ Reveal Word" to see the correct spelling

6. **Continue**: Click "Next Word" to move on, or "Finish Practice" when done

### For Teachers/Coaches

To set up the app:

1. Make sure the API server is running:
   ```bash
   npm run dev
   ```

2. Share the URL with students:
   ```
   http://[server-ip]:3001/apps/spelling-practice.html
   ```

3. Students can use any modern browser (Chrome, Firefox, Safari, Edge)

## Browser Compatibility

The app uses the Web Speech API, which is supported by:
- ✅ Chrome/Chromium (Desktop & Android)
- ✅ Safari (macOS & iOS)
- ✅ Microsoft Edge
- ✅ Firefox (Desktop)

**Note**: Make sure your browser has text-to-speech enabled and volume is turned up!

## Privacy & Data

- **100% Client-Side**: All word processing happens in your browser
- **No Data Collection**: Words are not stored or sent to any server
- **No External APIs**: Uses browser's built-in speech synthesis
- **COPPA/FERPA Compliant**: No student data leaves the device

## Technical Details

- **Technology**: Pure HTML5, CSS3, and JavaScript
- **Text-to-Speech**: Web Speech API (`window.speechSynthesis`)
- **No Dependencies**: No external libraries required
- **Lightweight**: Single HTML file (~15KB)

## Customization

Teachers can easily customize the app by editing `spelling-practice.html`:

- **Speech Rate**: Line 364 - Change `utterance.rate` (0.5 = slow, 1.5 = fast)
- **Voice Pitch**: Line 365 - Change `utterance.pitch`
- **Colors**: Modify the `<style>` section at the top
- **Button Text**: Change button labels in the HTML

## Troubleshooting

**"Text-to-speech is not available"**
- Try a different browser (Chrome recommended)
- Check browser permissions for audio
- Make sure device isn't muted

**Words not speaking**
- Check system volume
- Try clicking "Speak Word" button
- Some browsers need user interaction before speech works

**App not loading**
- Make sure the API server is running
- Check the URL is correct
- Try refreshing the page

## Future Enhancements

Possible improvements:
- Save word lists for later use (requires API integration)
- Track which words were revealed (study mode)
- Adjustable speech rate/voice selection
- Support for sentences and definitions
- Integration with the lesson system

## License

Part of the STEM Lab Assistant project - for educational use in elementary schools.
