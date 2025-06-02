"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Play,
  Pause,
  Code,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Terminal,
  AlertTriangle,
  Bug,
  Lightbulb,
  RotateCcw,
  Skull,
} from "lucide-react"

// Game types
type Position = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type CellType = "empty" | "wall" | "food" | "snake" | "challenge" | "bug"

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "Junior" | "Mid" | "Senior"
  category: "Algorithm" | "Debug" | "Optimize"
  language: string
  template: string
  solution: string
  testCases: Array<{ input: any; expected: any; description?: string }>
  points: number
  hints: string[]
}

interface TestResult {
  passed: boolean
  message: string
  type: "success" | "failure" | "error" | "syntax"
  details?: string
  hint?: string
}

interface GameState {
  snake: Position[]
  direction: Direction
  food: Position[]
  challenges: Position[]
  bugs: Position[]
  score: number
  level: number
  isPlaying: boolean
  gameOver: boolean
  currentChallenge: Challenge | null
  solvedChallenges: Set<string>
  countdown: number | null
}

// Enhanced challenges with better error handling
const challenges: Challenge[] = [
  {
    id: "array-sum",
    title: "Array Sum Algorithm",
    description: "Implement a function that returns the sum of all numbers in a list",
    difficulty: "Junior",
    category: "Algorithm",
    language: "python",
    template: `def array_sum(numbers):
    # Your code here
    # Hint: Use a loop or built-in sum() function
    pass`,
    solution: `def array_sum(numbers):
    return sum(numbers)`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 10, description: "Sum of [1, 2, 3, 4]" },
      { input: [[0, -1, 5]], expected: 4, description: "Sum with negative numbers" },
      { input: [[]], expected: 0, description: "Empty list should return 0" },
      { input: [[42]], expected: 42, description: "Single element list" },
    ],
    points: 100,
    hints: [
      "Try using Python's built-in sum() function",
      "Remember to handle empty lists (they should return 0)",
      "You can also use a for loop: total = 0; for num in numbers: total += num",
    ],
  },
  {
    id: "find-bug",
    title: "Debug the Loop",
    description: "Fix the infinite loop in this function",
    difficulty: "Mid",
    category: "Debug",
    language: "python",
    template: `def count_down(n):
    while n > 0:
        print(n)
        # Bug: missing decrement
    return "Done!"`,
    solution: `def count_down(n):
    while n > 0:
        print(n)
        n -= 1  # Fixed: added decrement
    return "Done!"`,
    testCases: [
      { input: [3], expected: "Done!", description: "Countdown from 3" },
      { input: [1], expected: "Done!", description: "Countdown from 1" },
      { input: [0], expected: "Done!", description: "No countdown needed" },
    ],
    points: 200,
    hints: [
      "The loop variable 'n' needs to be decremented each iteration",
      "Add 'n -= 1' or 'n = n - 1' inside the while loop",
      "Without decrementing n, the condition 'n > 0' will always be true",
    ],
  },
  {
    id: "list-comprehension",
    title: "List Comprehension Challenge",
    description: "Create a list of squares for even numbers from 0 to n",
    difficulty: "Senior",
    category: "Algorithm",
    language: "python",
    template: `def even_squares(n):
    # Use list comprehension to create squares of even numbers
    # from 0 to n (inclusive)
    # Example: even_squares(5) should return [0, 4, 16]
    pass`,
    solution: `def even_squares(n):
    return [x**2 for x in range(n+1) if x % 2 == 0]`,
    testCases: [
      { input: [5], expected: [0, 4, 16], description: "Even squares from 0 to 5" },
      { input: [8], expected: [0, 4, 16, 36, 64], description: "Even squares from 0 to 8" },
      { input: [0], expected: [0], description: "Only 0 is even from 0 to 0" },
      { input: [1], expected: [0], description: "Only 0 is even from 0 to 1" },
    ],
    points: 300,
    hints: [
      "Use list comprehension: [expression for item in range if condition]",
      "Check if a number is even with: x % 2 == 0",
      "Square a number with: x**2 or x*x",
      "Remember to include n in the range: range(n+1)",
    ],
  },
]

const GRID_SIZE = 15
const CELL_SIZE = 30

// Python syntax highlighting keywords
const pythonKeywords = [
  "def",
  "return",
  "if",
  "else",
  "elif",
  "for",
  "while",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
  "import",
  "from",
  "as",
  "class",
  "try",
  "except",
  "finally",
  "with",
  "pass",
  "break",
  "continue",
  "lambda",
  "global",
  "nonlocal",
  "is",
  "del",
]

const pythonBuiltins = [
  "print",
  "len",
  "range",
  "sum",
  "min",
  "max",
  "sorted",
  "list",
  "dict",
  "set",
  "tuple",
  "int",
  "str",
  "float",
  "bool",
  "enumerate",
  "zip",
  "map",
  "filter",
  "any",
  "all",
]

export default function CodeQuestGame() {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 7, y: 7 }],
    direction: "RIGHT",
    food: [{ x: 12, y: 10 }],
    challenges: [
      { x: 3, y: 3 },
      { x: 11, y: 5 },
      { x: 6, y: 12 },
    ],
    bugs: [
      { x: 8, y: 11 },
      { x: 13, y: 3 },
      { x: 2, y: 9 },
    ],
    score: 0,
    level: 1,
    isPlaying: false,
    gameOver: false,
    currentChallenge: null,
    solvedChallenges: new Set(),
    countdown: null,
  })

  const [userCode, setUserCode] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showHints, setShowHints] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [highlightedCode, setHighlightedCode] = useState("")
  const [showEditor, setShowEditor] = useState(true)

  // Syntax highlighting function
  const highlightPythonSyntax = (code: string) => {
    if (!code) return ""

    // Create a div to hold the highlighted code
    let highlighted = code.replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // Highlight strings
    highlighted = highlighted.replace(/(["'])(.*?)\1/g, '<span class="text-amber-300">$&</span>')

    // Highlight comments
    highlighted = highlighted.replace(/(#.*)$/gm, '<span class="text-emerald-300">$&</span>')

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-violet-300">$&</span>')

    // Highlight keywords
    pythonKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g")
      highlighted = highlighted.replace(regex, `<span class="text-rose-300">$&</span>`)
    })

    // Highlight built-in functions
    pythonBuiltins.forEach((builtin) => {
      const regex = new RegExp(`\\b${builtin}\\b`, "g")
      highlighted = highlighted.replace(regex, `<span class="text-blue-300">$&</span>`)
    })

    // Replace spaces with non-breaking spaces to preserve indentation
    highlighted = highlighted.replace(/ {4}/g, "&nbsp;&nbsp;&nbsp;&nbsp;")

    // Replace newlines with <br> tags
    highlighted = highlighted.replace(/\n/g, "<br>")

    return highlighted
  }

  // Update highlighted code when user code changes
  useEffect(() => {
    if (gameState.currentChallenge) {
      const codeToHighlight = userCode || gameState.currentChallenge.template
      setHighlightedCode(highlightPythonSyntax(codeToHighlight))
    }
  }, [userCode, gameState.currentChallenge])

  // Countdown effect
  useEffect(() => {
    if (gameState.countdown === null) return

    if (gameState.countdown === 0) {
      setGameState((prev) => ({ ...prev, countdown: null, isPlaying: true }))
      return
    }

    const countdownTimer = setTimeout(() => {
      setGameState((prev) => ({ ...prev, countdown: prev.countdown! - 1 }))
    }, 1000)

    return () => clearTimeout(countdownTimer)
  }, [gameState.countdown])

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver || gameState.currentChallenge || gameState.countdown !== null) return

    const gameLoop = setInterval(() => {
      setGameState((prev) => {
        // Don't update if game is not playing or if there's a challenge active or countdown is running
        if (!prev.isPlaying || prev.gameOver || prev.currentChallenge || prev.countdown !== null) {
          return prev
        }

        const newSnake = [...prev.snake]
        const head = { ...newSnake[0] }

        // Move snake head based on direction
        switch (prev.direction) {
          case "UP":
            head.y = Math.max(0, head.y - 1)
            break
          case "DOWN":
            head.y = Math.min(GRID_SIZE - 1, head.y + 1)
            break
          case "LEFT":
            head.x = Math.max(0, head.x - 1)
            break
          case "RIGHT":
            head.x = Math.min(GRID_SIZE - 1, head.x + 1)
            break
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          return { ...prev, gameOver: true, isPlaying: false }
        }

        // Check self collision (skip head)
        if (newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)) {
          return { ...prev, gameOver: true, isPlaying: false }
        }

        newSnake.unshift(head)

        // Check food collision
        const foodIndex = prev.food.findIndex((f) => f.x === head.x && f.y === head.y)
        if (foodIndex !== -1) {
          const newFood = prev.food.filter((_, i) => i !== foodIndex)
          // Generate new food in empty space
          let newFoodPos
          do {
            newFoodPos = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            }
          } while (newSnake.some((s) => s.x === newFoodPos.x && s.y === newFoodPos.y))

          return {
            ...prev,
            snake: newSnake,
            food: newFood.length > 0 ? newFood : [newFoodPos],
            score: prev.score + 10,
          }
        }

        // Check challenge collision
        const challengeIndex = prev.challenges.findIndex((c) => c.x === head.x && c.y === head.y)
        if (challengeIndex !== -1) {
          const challenge = challenges[challengeIndex % challenges.length]
          return {
            ...prev,
            snake: newSnake.slice(0, -1), // Don't grow when hitting challenge
            currentChallenge: challenge,
            isPlaying: false,
          }
        }

        // Check bug collision
        const bugIndex = prev.bugs.findIndex((b) => b.x === head.x && b.y === head.y)
        if (bugIndex !== -1) {
          // Bug found! Lose a segment but ensure snake doesn't disappear
          const newSnakeAfterBug = newSnake.length > 2 ? newSnake.slice(0, -2) : newSnake.slice(0, -1)
          const newScore = Math.max(0, prev.score - 20)

          // Check if score goes negative (game over condition)
          if (prev.score - 20 < 0) {
            return {
              ...prev,
              snake: newSnakeAfterBug.length > 0 ? newSnakeAfterBug : [head],
              bugs: prev.bugs.filter((_, i) => i !== bugIndex),
              score: 0,
              gameOver: true,
              isPlaying: false,
            }
          }

          return {
            ...prev,
            snake: newSnakeAfterBug.length > 0 ? newSnakeAfterBug : [head], // Ensure at least one segment
            bugs: prev.bugs.filter((_, i) => i !== bugIndex),
            score: newScore,
          }
        }

        // Normal movement - remove tail
        return { ...prev, snake: newSnake.slice(0, -1) }
      })
    }, 250) // Slightly slower for better control

    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, gameState.gameOver, gameState.currentChallenge, gameState.countdown])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.currentChallenge || gameState.countdown !== null) return

      const newDirection = (() => {
        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            return "UP"
          case "ArrowDown":
          case "s":
          case "S":
            return "DOWN"
          case "ArrowLeft":
          case "a":
          case "A":
            return "LEFT"
          case "ArrowRight":
          case "d":
          case "D":
            return "RIGHT"
          default:
            return null
        }
      })()

      if (newDirection) {
        setGameState((prev) => ({ ...prev, direction: newDirection as Direction }))
      }

      if (e.key === " ") {
        e.preventDefault()
        toggleGame()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState.currentChallenge, gameState.countdown])

  const toggleGame = () => {
    setGameState((prev) => {
      if (prev.isPlaying) {
        // If playing, pause immediately
        return { ...prev, isPlaying: false, countdown: null }
      } else {
        // If not playing, start countdown
        return { ...prev, countdown: 3 }
      }
    })
  }

  const resetGame = () => {
    setGameState({
      snake: [{ x: 7, y: 7 }],
      direction: "RIGHT",
      food: [{ x: 12, y: 10 }],
      challenges: [
        { x: 3, y: 3 },
        { x: 11, y: 5 },
        { x: 6, y: 12 },
      ],
      bugs: [
        { x: 8, y: 11 },
        { x: 13, y: 3 },
        { x: 2, y: 9 },
      ],
      score: 0,
      level: 1,
      isPlaying: false,
      gameOver: false,
      currentChallenge: null,
      solvedChallenges: new Set(),
      countdown: null,
    })
    setUserCode("")
    setTestResults([])
    setShowHints(false)
    setCurrentHintIndex(0)
  }

  // Auto-indent function for the code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only handle special keys if this is actually the code editor textarea
    if (!textareaRef.current || e.currentTarget !== textareaRef.current) {
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      // Insert 4 spaces for tab (Python standard)
      const newValue = userCode.substring(0, start) + "    " + userCode.substring(end)
      setUserCode(newValue)

      // Move cursor position after the inserted tab
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 4
        }
      })
    }

    // Auto-indent after pressing Enter
    if (e.key === "Enter") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = textarea.value
      const currentLine = currentValue.substring(0, start).split("\n").pop() || ""

      // Calculate indentation of current line
      const match = currentLine.match(/^(\s+)/)
      const indentation = match ? match[1] : ""

      // Add extra indentation if line ends with colon
      const extraIndent = currentLine.trim().endsWith(":") ? "    " : ""

      // Add new line with same indentation
      const newValue = currentValue.substring(0, start) + "\n" + indentation + extraIndent + currentValue.substring(end)
      setUserCode(newValue)

      // Move cursor position after the inserted newline and indentation
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indentation.length + extraIndent.length
        }
      })
    }
  }

  // Enhanced code execution with better error handling
  const runCode = () => {
    if (!gameState.currentChallenge) return

    // Basic syntax validation
    const codeToTest = userCode.trim()
    if (!codeToTest) {
      setTestResults([
        {
          passed: false,
          message: "No code provided",
          type: "error",
          details: "Please write some code before running tests.",
          hint: "Start by implementing the function as described in the challenge.",
        },
      ])
      return
    }

    if (!codeToTest.includes("def ")) {
      setTestResults([
        {
          passed: false,
          message: "Function definition missing",
          type: "syntax",
          details: "Your code should contain a function definition starting with 'def'.",
          hint: "Make sure you have a function definition like 'def function_name():'",
        },
      ])
      return
    }

    if (codeToTest.includes("pass") && codeToTest.split("\n").length <= 3) {
      setTestResults([
        {
          passed: false,
          message: "Function not implemented",
          type: "error",
          details: "The function still contains 'pass' and appears to be unimplemented.",
          hint: "Replace 'pass' with your actual implementation.",
        },
      ])
      return
    }

    try {
      // Special handling for specific challenges
      if (gameState.currentChallenge.id === "find-bug") {
        // Direct solution check for the countdown function
        if (codeToTest.includes("n -= 1") || codeToTest.includes("n = n - 1")) {
          setTestResults([
            {
              passed: true,
              message: "Test 1: ✅ Countdown from 3",
              type: "success",
            },
            {
              passed: true,
              message: "Test 2: ✅ Countdown from 1",
              type: "success",
            },
            {
              passed: true,
              message: "Test 3: ✅ No countdown needed",
              type: "success",
            },
          ])

          // Challenge solved!
          const challenge = gameState.currentChallenge
          setGameState((prev) => ({
            ...prev,
            currentChallenge: null,
            isPlaying: true,
            solvedChallenges: new Set([...prev.solvedChallenges, challenge.id]),
            score: prev.score + challenge.points,
          }))

          toast({
            title: "Challenge Solved! 🎉",
            description: `+${challenge.points} points earned!`,
          })

          // Reset hints
          setShowHints(false)
          setCurrentHintIndex(0)
          return
        } else {
          setTestResults([
            {
              passed: false,
              message: "Test 1: ❌ Infinite loop detected",
              type: "failure",
              details: "The function doesn't decrement 'n', causing an infinite loop.",
              hint: "Add 'n -= 1' inside the while loop to fix the infinite loop.",
            },
            {
              passed: false,
              message: "Test 2: ❌ Infinite loop detected",
              type: "failure",
              details: "The function doesn't decrement 'n', causing an infinite loop.",
              hint: "Add 'n -= 1' inside the while loop to fix the infinite loop.",
            },
            {
              passed: false,
              message: "Test 3: ❌ Infinite loop detected",
              type: "failure",
              details: "The function doesn't decrement 'n', causing an infinite loop.",
              hint: "Add 'n -= 1' inside the while loop to fix the infinite loop.",
            },
          ])
          return
        }
      }

      // For other challenges, use the standard evaluation
      const results: TestResult[] = gameState.currentChallenge.testCases.map((testCase, index) => {
        try {
          // Enhanced Python to JavaScript conversion
          let jsCode = userCode
            .replace(/def\s+(\w+)\s*\(/g, "function $1(")
            .replace(/:\s*$/gm, " {")
            .replace(/pass\s*$/gm, "return undefined;")
            .replace(/print\s*\(/g, "console.log(")
            .replace(/True/g, "true")
            .replace(/False/g, "false")
            .replace(/None/g, "null")
            .replace(/elif/g, "else if")
            .replace(/and/g, "&&")
            .replace(/or/g, "||")
            .replace(/not\s+/g, "!")
            .replace(/range\s*$$\s*(\d+)\s*$$/g, "Array.from({length: $1}, (_, i) => i)")
            .replace(/range\s*$$\s*(\d+)\s*,\s*(\d+)\s*$$/g, "Array.from({length: $2 - $1}, (_, i) => i + $1)")
            .replace(/range\s*$$\s*(\w+)\s*\+\s*1\s*$$/g, "Array.from({length: $1 + 1}, (_, i) => i)")
            .replace(/(\w+)\s*%\s*(\d+)\s*==\s*0/g, "$1 % $2 === 0")
            .replace(/\*\*/g, "Math.pow") // Convert ** to Math.pow

          // Enhanced list comprehension handling
          jsCode = jsCode.replace(
            /\[([^[\]]+)\s+for\s+(\w+)\s+in\s+range\s*$$\s*(\w+)\s*\+\s*1\s*$$\s+if\s+([^[\]]+)\]/g,
            "Array.from({length: $3 + 1}, (_, $2) => $2).filter($2 => $4).map($2 => $1)",
          )

          jsCode = jsCode.replace(
            /\[([^[\]]+)\s+for\s+(\w+)\s+in\s+([^[\]]+)\s+if\s+([^[\]]+)\]/g,
            "$3.filter($2 => $4).map($2 => $1)",
          )

          // Add proper function closing braces
          const lines = jsCode.split("\n")
          const result = []
          let braceCount = 0

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes("function")) {
              result.push(line)
              braceCount++
            } else if (line.trim() && !line.includes("}")) {
              result.push(line)
            } else if (line.includes("}")) {
              result.push(line)
              braceCount--
            }
          }

          // Add missing closing braces
          while (braceCount > 0) {
            result.push("}")
            braceCount--
          }

          jsCode = result.join("\n")

          // Add built-in functions
          const builtins = `
            function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
            function len(arr) { return arr.length; }
            function range(start, end) {
              if (end === undefined) { end = start; start = 0; }
              return Array.from({length: end - start}, (_, i) => i + start);
            }
          `

          const fullCode = builtins + "\n" + jsCode

          // Execute the code
          const func = new Function("return " + fullCode)()
          const functionName = gameState.currentChallenge.id.replace(/-/g, "_")

          let targetFunction
          if (functionName === "array_sum") targetFunction = func.array_sum
          else if (functionName === "find_bug") targetFunction = func.count_down
          else if (functionName === "list_comprehension") targetFunction = func.even_squares
          else {
            // Try to find any function in the code
            const funcNames = Object.keys(func).filter((key) => typeof func[key] === "function")
            if (funcNames.length > 0) {
              targetFunction = func[funcNames[0]]
            }
          }

          if (!targetFunction) {
            return {
              passed: false,
              message: `Test ${index + 1}: Function not found`,
              type: "error",
              details: "The expected function was not found in your code.",
              hint: "Make sure your function name matches the template exactly.",
            }
          }

          const result_value = Array.isArray(testCase.input)
            ? targetFunction(...testCase.input)
            : targetFunction(testCase.input)
          const passed = JSON.stringify(result_value) === JSON.stringify(testCase.expected)

          return {
            passed,
            message: passed
              ? `Test ${index + 1}: ✅ ${testCase.description || "Passed"}`
              : `Test ${index + 1}: ❌ ${testCase.description || "Failed"}`,
            type: passed ? "success" : "failure",
            details: passed
              ? undefined
              : `Expected: ${JSON.stringify(testCase.expected)}, Got: ${JSON.stringify(result_value)}`,
            hint: passed ? undefined : "Check your logic and try again.",
          } as TestResult
        } catch (error) {
          return {
            passed: false,
            message: `Test ${index + 1}: ❌ Runtime Error`,
            type: "error",
            details: `${error}`,
            hint: "Check for syntax errors, undefined variables, or logic issues.",
          } as TestResult
        }
      })

      setTestResults(results)

      const allPassed = results.every((r) => r.passed)
      if (allPassed) {
        // Challenge solved!
        const challenge = gameState.currentChallenge

        setGameState((prev) => ({
          ...prev,
          currentChallenge: null,
          isPlaying: true,
          solvedChallenges: new Set([...prev.solvedChallenges, challenge.id]),
          score: prev.score + challenge.points,
        }))

        toast({
          title: "Challenge Solved! 🎉",
          description: `+${challenge.points} points earned!`,
        })

        // Reset hints
        setShowHints(false)
        setCurrentHintIndex(0)
      }
    } catch (error) {
      setTestResults([
        {
          passed: false,
          message: "Syntax Error",
          type: "syntax",
          details: `${error}`,
          hint: "Check your Python syntax. Make sure indentation is correct and all statements are valid.",
        },
      ])
    }
  }

  const closeChallenge = () => {
    setGameState((prev) => ({ ...prev, currentChallenge: null, isPlaying: true }))
    setUserCode("")
    setTestResults([])
    setShowHints(false)
    setCurrentHintIndex(0)
  }

  const showNextHint = () => {
    if (!gameState.currentChallenge) return

    if (!showHints) {
      setShowHints(true)
      setCurrentHintIndex(0)
    } else if (currentHintIndex < gameState.currentChallenge.hints.length - 1) {
      setCurrentHintIndex((prev) => prev + 1)
    }
  }

  const getCellType = (x: number, y: number): CellType => {
    if (gameState.snake.some((s) => s.x === x && s.y === y)) return "snake"
    if (gameState.food.some((f) => f.x === x && f.y === y)) return "food"
    if (gameState.challenges.some((c) => c.x === x && c.y === y)) return "challenge"
    if (gameState.bugs.some((b) => b.x === x && b.y === y)) return "bug"
    return "empty"
  }

  const getCellStyle = (cellType: CellType) => {
    switch (cellType) {
      case "snake":
        return "bg-emerald-400 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
      case "food":
        return "bg-violet-400 border border-violet-300 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]"
      case "challenge":
        return "bg-amber-400 border border-amber-300 animate-bounce shadow-[0_0_20px_rgba(251,191,36,0.9)]"
      case "bug":
        return "bg-rose-500 border border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
      default:
        return "bg-slate-900 border border-slate-700/30"
    }
  }

  const getTestResultIcon = (type: TestResult["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "failure":
        return <XCircle className="w-4 h-4 text-rose-400" />
      case "error":
        return <Bug className="w-4 h-4 text-orange-400" />
      case "syntax":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      default:
        return <XCircle className="w-4 h-4 text-rose-400" />
    }
  }

  const getTestResultStyle = (type: TestResult["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-900/30 text-emerald-100 border-emerald-500/50"
      case "failure":
        return "bg-rose-900/30 text-rose-100 border-rose-500/50"
      case "error":
        return "bg-orange-900/30 text-orange-100 border-orange-500/50"
      case "syntax":
        return "bg-amber-900/30 text-amber-100 border-amber-500/50"
      default:
        return "bg-rose-900/30 text-rose-100 border-rose-500/50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 p-2 relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(emerald-400 1px, transparent 1px),
            linear-gradient(90deg, emerald-400 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="h-full w-full"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, emerald-400 2px, emerald-400 4px)",
          }}
        ></div>
      </div>

      {/* Countdown Overlay */}
      {gameState.countdown !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-violet-400 to-indigo-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-pulse">
              {gameState.countdown === 0 ? "GO!" : gameState.countdown}
            </div>
            <div className="text-xl text-emerald-200 mt-4 font-mono">
              {gameState.countdown === 0 ? "SYSTEM INITIALIZED" : "INITIALIZING SYSTEM..."}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              <Skull className="w-24 h-24 mx-auto text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse" />
            </div>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] mb-4">
              GAME OVER
            </div>
            <div className="text-xl text-rose-200 mb-2 font-mono">SYSTEM CORRUPTED</div>
            <div className="text-lg text-slate-300 mb-6 font-mono">
              Final Score: <span className="text-amber-400">{gameState.score}</span>
            </div>
            <div className="text-sm text-slate-400 mb-8 leading-relaxed">
              Your code execution failed catastrophically! Too many bugs corrupted the system. Time to debug your
              approach and try again.
            </div>
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border border-rose-400/50 text-lg px-8 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              RESTART SYSTEM
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-3 text-center">
          <h1 className="text-4xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-violet-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
            <Code className="inline mr-2 text-emerald-400" />
            v0 CODE QUEST
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left Column - Game Arena */}
          <div>
            {/* Game Controls */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleGame}
                  disabled={gameState.countdown !== null || gameState.gameOver}
                  className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-400 hover:to-violet-400 text-white shadow-[0_0_10px_rgba(52,211,153,0.5)] border border-emerald-400/50 disabled:opacity-50"
                >
                  {gameState.isPlaying || gameState.countdown !== null ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" /> PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> PLAY
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="icon"
                  className="border-indigo-500/50 text-indigo-100 hover:bg-indigo-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                <span className="text-xl font-bold text-amber-100">{gameState.score}</span>
              </div>
            </div>

            {/* Game Arena */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(52,211,153,0.3)] backdrop-blur-sm">
              <CardContent className="p-3">
                <div
                  className="gap-0 border-2 border-emerald-500/50 p-2 bg-black/80 shadow-[inset_0_0_20px_rgba(52,211,153,0.2)] backdrop-blur-sm"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
                    const x = i % GRID_SIZE
                    const y = Math.floor(i / GRID_SIZE)
                    const cellType = getCellType(x, y)
                    return <div key={i} className={`w-6 h-6 ${getCellStyle(cellType)}`} />
                  })}
                </div>

                {gameState.gameOver && (
                  <Alert className="mt-4 border-rose-500/50 bg-rose-900/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <Skull className="h-4 w-4 text-rose-400" />
                    <AlertDescription className="text-rose-100">
                      SYSTEM CORRUPTED • Final Score: {gameState.score}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-400 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.7)]"></div>
                <span className="text-emerald-100 text-xs">PLAYER</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-violet-400 border border-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
                <span className="text-violet-100 text-xs">DATA (+10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-400 border border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.9)]"></div>
                <span className="text-amber-100 text-xs">CHALLENGE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-500 border border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]"></div>
                <span className="text-rose-100 text-xs">BUG (-20)</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-2 text-xs text-emerald-200 bg-slate-900/50 p-2 rounded border border-emerald-500/20">
              Use <span className="text-amber-400">WASD</span> or <span className="text-amber-400">Arrow Keys</span> to
              move • Avoid bugs or face system corruption!
            </div>
          </div>

          {/* Right Column - Challenge Area */}
          <div>
            {gameState.currentChallenge ? (
              <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-amber-500/50 shadow-[0_0_25px_rgba(251,191,36,0.3)] backdrop-blur-sm">
                <CardHeader className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-amber-100 text-lg font-mono">
                        {gameState.currentChallenge.title}
                      </CardTitle>
                      <CardDescription className="text-amber-200 text-xs">
                        {gameState.currentChallenge.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-100 border-amber-500/50">
                      {gameState.currentChallenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* Code Editor Header */}
                  <div className="flex justify-between items-center bg-slate-800 rounded-t-md p-2 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono text-emerald-200">
                        {gameState.currentChallenge.language.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900 border-r border-slate-700 flex flex-col items-center pt-1 text-xs text-slate-500 font-mono">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-6 w-full text-center">
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Hidden textarea for editing */}
                    <Textarea
                      ref={textareaRef}
                      value={userCode || gameState.currentChallenge.template}
                      onChange={(e) => setUserCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`font-mono text-sm bg-slate-800/80 border-emerald-500/50 h-[200px] text-emerald-100 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)] pl-10 resize-none ${showEditor ? "block" : "absolute opacity-0 pointer-events-none"}`}
                      placeholder="Write your code here..."
                      spellCheck="false"
                    />

                    {/* Syntax highlighted display */}
                    {!showEditor && (
                      <div
                        className="font-mono text-sm bg-slate-800/80 border border-emerald-500/50 h-[200px] text-emerald-100 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)] pl-10 pr-3 py-2 overflow-auto"
                        onClick={() => {
                          setShowEditor(true)
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus()
                            }
                          }, 10)
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                      ></div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={runCode}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          runCode()
                        }
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-emerald-400/50"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      RUN CODE
                    </Button>
                    <Button
                      onClick={showNextHint}
                      variant="outline"
                      className="border-violet-500/50 text-violet-100 hover:bg-violet-500/20"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      HINT
                    </Button>
                    <Button
                      onClick={closeChallenge}
                      variant="outline"
                      className="border-orange-500/50 text-orange-100 hover:bg-orange-500/20"
                    >
                      SKIP
                    </Button>
                  </div>

                  {/* Hints Section */}
                  {showHints && gameState.currentChallenge && (
                    <div className="bg-violet-900/30 border border-violet-500/50 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-violet-400" />
                        <span className="text-violet-100 font-mono text-sm">HINT {currentHintIndex + 1}</span>
                      </div>
                      <p className="text-violet-200 text-xs">{gameState.currentChallenge.hints[currentHintIndex]}</p>
                      {currentHintIndex < gameState.currentChallenge.hints.length - 1 && (
                        <Button
                          onClick={showNextHint}
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-violet-300 hover:text-violet-100"
                        >
                          Next Hint →
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Enhanced Test Results */}
                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-emerald-100 font-mono text-sm">TEST RESULTS</h4>
                      {testResults.map((result, index) => (
                        <div key={index} className="space-y-1">
                          <div
                            className={`p-2 rounded border font-mono text-xs flex items-start gap-2 ${getTestResultStyle(result.type)}`}
                          >
                            {getTestResultIcon(result.type)}
                            <div className="flex-1">
                              <div>{result.message}</div>
                              {result.details && <div className="mt-1 text-xs opacity-80">{result.details}</div>}
                              {result.hint && <div className="mt-1 text-xs italic opacity-70">💡 {result.hint}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(52,211,153,0.3)] backdrop-blur-sm h-full">
                <CardHeader className="p-3">
                  <CardTitle className="text-emerald-100 text-lg font-mono">DEVELOPER DASHBOARD</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <h3 className="font-medium text-emerald-100 font-mono text-sm">CHALLENGES</h3>
                    {challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className={`p-3 border rounded-lg backdrop-blur-sm ${
                          gameState.solvedChallenges.has(challenge.id)
                            ? "border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                            : "border-slate-500/50 bg-slate-800/30"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-emerald-100 font-mono text-sm">{challenge.title}</h4>
                            <p className="text-xs text-emerald-200">{challenge.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-slate-800/50 text-emerald-300 border-emerald-500/30"
                              >
                                {challenge.language}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-slate-800/50 text-violet-300 border-violet-500/30"
                              >
                                {challenge.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {gameState.solvedChallenges.has(challenge.id) && (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4">
                      <h3 className="font-medium text-emerald-100 font-mono text-sm mb-2">SKILL PROGRESS</h3>
                      <Progress
                        value={gameState.score / 5}
                        className="h-2 bg-slate-800/50 border border-emerald-500/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
