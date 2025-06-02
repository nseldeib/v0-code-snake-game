# 🎮 v0 Code Quest

A retro-futuristic coding game that combines the classic Snake gameplay with Python programming challenges. Navigate through a neon-lit digital world, collect data, solve coding puzzles, and avoid system bugs!

## 🌟 Features

### 🐍 **Snake Game Mechanics**
- Classic snake movement with WASD or arrow keys
- Collect data packets to grow and earn points
- Avoid bugs that corrupt your system and reduce your score
- Game over when your score goes negative (system corruption)

### 💻 **Coding Challenges**
- **Python Programming**: Solve real coding problems to progress
- **Syntax Highlighting**: Beautiful color-coded Python editor
- **Multiple Difficulty Levels**: Junior, Mid, and Senior developer challenges
- **Instant Feedback**: Real-time test results and error messages
- **Hint System**: Progressive hints to help you solve challenges

### 🎨 **Visual Design**
- **Retro-Futuristic Aesthetic**: Neon colors and cyberpunk styling
- **Animated Elements**: Glowing effects, scanlines, and smooth transitions
- **Responsive Design**: Works on desktop and laptop screens
- **Color-Coded UI**: Emerald, violet, amber, and rose color scheme

## 🎯 Game Elements

| Element | Color | Effect | Points |
|---------|-------|--------|--------|
| 🟢 Player | Emerald | Your snake character | - |
| 🟣 Data | Violet | Collect to grow and earn points | +10 |
| 🟡 Challenge | Amber | Triggers coding challenges | Variable |
| 🔴 Bug | Rose | Reduces score and snake length | -20 |

## 🧩 Coding Challenges

### 1. **Array Sum Algorithm** (Junior - 100 pts)
Implement a function that returns the sum of all numbers in a list.

\`\`\`python
def array_sum(numbers):
    return sum(numbers)
\`\`\`

### 2. **Debug the Loop** (Mid - 200 pts)
Fix an infinite loop by adding the missing decrement.

\`\`\`python
def count_down(n):
    while n > 0:
        print(n)
        n -= 1  # This was missing!
    return "Done!"
\`\`\`

### 3. **List Comprehension** (Senior - 300 pts)
Create a list of squares for even numbers using list comprehension.

\`\`\`python
def even_squares(n):
    return [x**2 for x in range(n+1) if x % 2 == 0]
\`\`\`

## 🎮 How to Play

1. **Start the Game**: Click the "PLAY" button to begin
2. **Move Your Snake**: Use WASD or arrow keys to navigate
3. **Collect Data**: Move over violet data packets to grow and earn points
4. **Solve Challenges**: Hit amber challenge squares to open coding puzzles
5. **Avoid Bugs**: Stay away from red bugs that corrupt your system
6. **Code Solutions**: Write Python code in the syntax-highlighted editor
7. **Run Tests**: Click "RUN CODE" to test your solution
8. **Get Hints**: Use the hint system if you're stuck
9. **Survive**: Don't let your score go negative or face system corruption!

## 🛠️ Technical Features

### **Code Editor**
- Syntax highlighting for Python keywords, functions, strings, and comments
- Auto-indentation for Python code blocks
- Tab support (converts to 4 spaces)
- Line numbers for easy reference

### **Test System**
- Real-time code execution and validation
- Comprehensive error handling and feedback
- Multiple test cases per challenge
- Detailed success/failure messages

### **Game Engine**
- Smooth 60fps gameplay loop
- Collision detection for all game elements
- Dynamic food/challenge/bug generation
- Score tracking and game state management

## 🎨 Color Scheme

The game uses a carefully crafted color palette:

- **Emerald** (#10B981): Player, success states, primary UI
- **Violet** (#8B5CF6): Data packets, hints, secondary elements
- **Amber** (#F59E0B): Challenges, warnings, score display
- **Rose** (#F43F5E): Bugs, errors, danger states
- **Slate** (#1E293B): Background, containers, neutral elements

## 🚀 Getting Started

This is a Next.js application built with:
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** icons

### Installation

1. Clone or download the project
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Game Strategy

### **Scoring Tips**
- Prioritize data collection for steady point growth
- Solve challenges for big point bonuses
- Avoid bugs at all costs - negative scores mean game over!

### **Challenge Strategy**
- Read the problem description carefully
- Use the hint system progressively
- Test your code frequently with the "RUN CODE" button
- Pay attention to error messages for debugging

### **Survival Tips**
- Plan your route to avoid bugs
- Don't get trapped in corners
- Balance risk vs. reward when approaching challenges near bugs

## 🏆 Scoring System

- **Data Collection**: +10 points per packet
- **Array Sum Challenge**: +100 points
- **Debug Challenge**: +200 points  
- **List Comprehension**: +300 points
- **Bug Collision**: -20 points (game over if score goes negative)

## 🎮 Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Up |
| S / ↓ | Move Down |
| A / ← | Move Left |
| D / → | Move Right |
| Space | Pause/Resume Game |
| Tab | Insert 4 spaces (in code editor) |
| Enter | Auto-indent (in code editor) |

## 🔮 Future Enhancements

- [ ] Additional challenge categories (Data Structures, Algorithms, etc.)
- [ ] Multiplayer mode with leaderboards
- [ ] More programming languages (JavaScript, TypeScript, etc.)
- [ ] Achievement system and badges
- [ ] Sound effects and background music
- [ ] Mobile touch controls
- [ ] Save/load game progress
- [ ] Custom challenge creator

## 🤝 Contributing

This project was built with v0 by Vercel. Feel free to fork, modify, and enhance the game! Some ideas for contributions:

- Add new coding challenges
- Implement additional game mechanics
- Improve the visual effects
- Add sound and music
- Create mobile-responsive controls

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using v0 by Vercel**

*Ready Player One? Let's code! 🚀*
\`\`\`

This README provides a comprehensive overview of the v0 Code Quest game, including:

- **Clear feature descriptions** with visual elements
- **Complete gameplay instructions** for new players
- **Technical documentation** for developers
- **Challenge solutions** for reference
- **Installation and setup** instructions
- **Strategy tips** for better gameplay
- **Future enhancement ideas** for contributors

The README uses proper Markdown formatting with tables, code blocks, emojis, and clear sections to make it both informative and visually appealing! 📚✨
