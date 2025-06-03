"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Play,
  Pause,
  Code,
  Trophy,
  CheckCircle,
  XCircle,
  Terminal,
  AlertTriangle,
  Bug,
  RotateCcw,
  Skull,
} from "lucide-react"

import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { Leaderboard } from "@/components/leaderboard"
import { supabase, type User } from "@/lib/supabase"

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
  testCases: Array<{ input: any; expected: any; description?: string; explanation?: string }>
  points: number
  hints: string[]
  learningObjectives: string[]
  commonMistakes: string[]
}

interface TestResult {
  passed: boolean
  message: string
  type: "success" | "failure" | "error" | "syntax"
  details?: string
  hint?: string
  suggestion?: string
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
  gameOverReason?: "wall" | "bug" | "self"
  currentChallenge: Challenge | null
  solvedChallenges: Set<string>
  countdown: number | null
}

// Enhanced challenges with better educational content
const challenges: Challenge[] = [
  {
    id: "array-sum",
    title: "Array Sum Algorithm",
    description:
      "Calculate the total sum of all numbers in a list. This fundamental operation is used in data analysis, statistics, and many algorithms.",
    difficulty: "Junior",
    category: "Algorithm",
    language: "python",
    template: `def array_sum(numbers):
  """
  Calculate the sum of all numbers in a list.
  
  Args:
      numbers (list): A list of integers or floats
      
  Returns:
      int/float: The sum of all numbers in the list
      
  Examples:
      array_sum([1, 2, 3]) -> 6
      array_sum([]) -> 0
      array_sum([-1, 1]) -> 0
  """
  # TODO: Implement the function
  # Hint: You can use a loop or Python's built-in sum() function
  pass`,
    solution: `def array_sum(numbers):
  """Calculate the sum of all numbers in a list."""
  return sum(numbers)`,
    testCases: [
      {
        input: [[1, 2, 3, 4]],
        expected: 10,
        description: "Sum of positive integers [1, 2, 3, 4]",
        explanation: "1 + 2 + 3 + 4 = 10",
      },
      {
        input: [[0, -1, 5]],
        expected: 4,
        description: "Sum with negative numbers [0, -1, 5]",
        explanation: "0 + (-1) + 5 = 4",
      },
      {
        input: [[]],
        expected: 0,
        description: "Empty list should return 0",
        explanation: "Sum of no numbers is 0 by definition",
      },
      {
        input: [[42]],
        expected: 42,
        description: "Single element list [42]",
        explanation: "Sum of one number is the number itself",
      },
      {
        input: [[-5, -10, -3]],
        expected: -18,
        description: "All negative numbers [-5, -10, -3]",
        explanation: "(-5) + (-10) + (-3) = -18",
      },
    ],
    points: 100,
    hints: [
      "Python has a built-in sum() function that can add all numbers in a list",
      "Alternative: Use a for loop with a running total: total = 0; for num in numbers: total += num",
      "Remember that sum([]) returns 0, which handles the empty list case automatically",
      "The sum() function works with both integers and floating-point numbers",
    ],
    learningObjectives: [
      "Understand list iteration and aggregation",
      "Learn about Python's built-in functions",
      "Practice handling edge cases (empty lists)",
    ],
    commonMistakes: ["Forgetting to handle empty lists", "Not returning the result", "Using incorrect variable names"],
  },
  {
    id: "find-bug",
    title: "Debug the Infinite Loop",
    description:
      "Fix a common programming bug that causes an infinite loop. This teaches the importance of loop control variables and debugging skills.",
    difficulty: "Mid",
    category: "Debug",
    language: "python",
    template: `def count_down(n):
  """
  Count down from n to 1, printing each number.
  
  Args:
      n (int): Starting number for countdown
      
  Returns:
      str: "Done!" when countdown is complete
      
  Examples:
      count_down(3) prints: 3, 2, 1 and returns "Done!"
      count_down(0) returns "Done!" immediately
  """
  while n > 0:
      print(n)
      # BUG: What's missing here to prevent infinite loop?
  return "Done!"`,
    solution: `def count_down(n):
  """Count down from n to 1, printing each number."""
  while n > 0:
      print(n)
      n -= 1  # Fixed: decrement n to eventually exit the loop
  return "Done!"`,
    testCases: [
      {
        input: [3],
        expected: "Done!",
        description: "Countdown from 3",
        explanation: "Should print 3, 2, 1 then return 'Done!'",
      },
      {
        input: [1],
        expected: "Done!",
        description: "Countdown from 1",
        explanation: "Should print 1 then return 'Done!'",
      },
      {
        input: [0],
        expected: "Done!",
        description: "No countdown needed for 0",
        explanation: "Loop condition n > 0 is false, so skip loop",
      },
    ],
    points: 200,
    hints: [
      "Look at the while loop condition: 'while n > 0'. What makes this condition eventually become false?",
      "The variable 'n' needs to change inside the loop, otherwise the condition 'n > 0' will always be true",
      "Add 'n -= 1' (or 'n = n - 1') inside the while loop to decrement n each iteration",
      "This is a classic infinite loop bug - the loop control variable isn't being modified",
    ],
    learningObjectives: [
      "Understand loop control variables",
      "Learn to identify and fix infinite loops",
      "Practice debugging systematic thinking",
    ],
    commonMistakes: [
      "Not modifying the loop control variable",
      "Incrementing instead of decrementing",
      "Placing the decrement outside the loop",
    ],
  },
  {
    id: "list-comprehension",
    title: "List Comprehension Mastery",
    description:
      "Create an elegant one-liner using Python's list comprehension to filter and transform data. This is a powerful Pythonic pattern.",
    difficulty: "Senior",
    category: "Algorithm",
    language: "python",
    template: `def even_squares(n):
  """
  Generate a list of squares for all even numbers from 0 to n (inclusive).
  
  Args:
      n (int): Upper limit (inclusive)
      
  Returns:
      list: Squares of even numbers from 0 to n
      
  Examples:
      even_squares(5) -> [0, 4, 16]  # squares of 0, 2, 4
      even_squares(8) -> [0, 4, 16, 36, 64]  # squares of 0, 2, 4, 6, 8
      even_squares(1) -> [0]  # only 0 is even from 0 to 1
  """
  # TODO: Use list comprehension to solve this in one line
  # Pattern: [expression for item in iterable if condition]
  # You need: square the number, iterate through range, filter for even
  pass`,
    solution: `def even_squares(n):
  """Generate squares of even numbers from 0 to n using list comprehension."""
  return [x**2 for x in range(n+1) if x % 2 == 0]`,
    testCases: [
      {
        input: [5],
        expected: [0, 4, 16],
        description: "Even squares from 0 to 5: [0², 2², 4²]",
        explanation: "Even numbers 0,2,4 squared give 0,4,16",
      },
      {
        input: [8],
        expected: [0, 4, 16, 36, 64],
        description: "Even squares from 0 to 8: [0², 2², 4², 6², 8²]",
        explanation: "Even numbers 0,2,4,6,8 squared give 0,4,16,36,64",
      },
      {
        input: [0],
        expected: [0],
        description: "Only 0 is even from 0 to 0",
        explanation: "Range is just [0], 0 is even, 0² = 0",
      },
      {
        input: [1],
        expected: [0],
        description: "Only 0 is even from 0 to 1",
        explanation: "Range is [0,1], only 0 is even, 0² = 0",
      },
      {
        input: [10],
        expected: [0, 4, 16, 36, 64, 100],
        description: "Even squares from 0 to 10",
        explanation: "Even numbers 0,2,4,6,8,10 squared",
      },
    ],
    points: 300,
    hints: [
      "List comprehension syntax: [expression for item in iterable if condition]",
      "You need three parts: x**2 (square), range(n+1) (numbers 0 to n), x % 2 == 0 (even check)",
      "Remember range(n+1) to include n in the range (range is exclusive of the end)",
      "The modulo operator % checks divisibility: x % 2 == 0 means x is even",
      "Complete solution: [x**2 for x in range(n+1) if x % 2 == 0]",
    ],
    learningObjectives: [
      "Master Python list comprehensions",
      "Understand filtering with conditions",
      "Practice mathematical operations in functional style",
    ],
    commonMistakes: [
      "Using range(n) instead of range(n+1)",
      "Forgetting the condition 'if x % 2 == 0'",
      "Using x*x instead of x**2 (both work, but ** is more Pythonic)",
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
    gameOverReason: undefined,
    currentChallenge: null,
    solvedChallenges: new Set(),
    countdown: null,
  })

  const [userCode, setUserCode] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showHints, setShowHints] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [showLearningObjectives, setShowLearningObjectives] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [highlightedCode, setHighlightedCode] = useState("")
  const [showEditor, setShowEditor] = useState(true)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

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
          return { ...prev, gameOver: true, isPlaying: false, gameOverReason: "wall" }
        }

        // Check self collision (skip head)
        if (newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)) {
          return { ...prev, gameOver: true, isPlaying: false, gameOverReason: "self" }
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
            // Update high score if logged in
            if (user && prev.score > user.high_score) {
              updateHighScore(prev.score)
            }

            return {
              ...prev,
              snake: newSnakeAfterBug.length > 0 ? newSnakeAfterBug : [head],
              bugs: prev.bugs.filter((_, i) => i !== bugIndex),
              score: 0,
              gameOver: true,
              isPlaying: false,
              gameOverReason: "bug",
            }
          }

          return {
            ...prev,
            snake: newSnakeAfterBug.length > 0 ? newSnakeAfterBug : [head], // Ensure at least one segment
            bugs: prev.bugs.filter((_, i) => i !== bugIndex),
            score: newScore,
          }
        }

        // Check if we need to add more bugs (maintain at least 3)
        if (prev.bugs.length < 3) {
          // Generate a new bug in an empty position
          let newBugPos
          do {
            newBugPos = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            }
          } while (
            // Make sure the new bug doesn't overlap with anything
            newSnake.some((s) => s.x === newBugPos.x && s.y === newBugPos.y) ||
            prev.food.some((f) => f.x === newBugPos.x && f.y === newBugPos.y) ||
            prev.challenges.some((c) => c.x === newBugPos.x && c.y === newBugPos.y) ||
            prev.bugs.some((b) => b.x === newBugPos.x && b.y === newBugPos.y)
          )

          // Add the new bug
          return {
            ...prev,
            snake: newSnake.slice(0, -1),
            bugs: [...prev.bugs, newBugPos],
          }
        }

        // Normal movement - remove tail
        return { ...prev, snake: newSnake.slice(0, -1) }
      })
    }, 250) // Slightly slower for better control

    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, gameState.gameOver, gameState.currentChallenge, gameState.countdown, user])

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

  // Auth state management - Fixed and simplified
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (mounted) {
            setAuthLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id)
        } else if (mounted) {
          setAuthLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    // Initialize auth
    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state change:", event, session?.user?.id)

      try {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchUserProfile(session.user.id)
          toast({
            title: "System Online! 💻",
            description: "Your progress will now be saved automatically.",
          })
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setAuthLoading(false)
          toast({
            title: "Logged Out",
            description: "Your progress has been saved. See you next time!",
          })
        } else if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setAuthLoading(false)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        setAuthLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      const { data, error, count } = await supabase.from("users").select("*", { count: "exact" }).eq("id", userId)

      if (error) {
        console.error("Error fetching user profile:", error)
        if (error.code === "PGRST116") {
          // User doesn't exist in our users table
          console.log("User not found in users table, this might be a new signup")
          setAuthLoading(false)
          return
        } else {
          toast({
            title: "Profile Error",
            description: "Failed to load user profile. Please try refreshing the page.",
          })
        }
      } else if (data && data.length > 0) {
        if (data.length > 1) {
          console.warn("Multiple users found with same ID:", data.length)
          // Use the first one but log the issue
          setUser(data[0])
        } else {
          console.log("User profile loaded:", data[0])
          setUser(data[0])
        }
      } else {
        console.log("No user profile found for ID:", userId)
        // User exists in auth but not in our users table
        // This can happen if signup didn't complete properly
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err)
      toast({
        title: "Connection Error",
        description: "Unable to connect to user database. Please check your connection.",
      })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        toast({
          title: "Logout Error",
          description: "Failed to log out. Please try again.",
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Unexpected sign out error:", error)
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  const updateHighScore = async (newScore: number) => {
    if (!user || newScore <= user.high_score) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          high_score: newScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!error) {
        setUser({ ...user, high_score: newScore })
      }
    } catch (err) {
      console.error("Error updating high score:", err)
    }
  }

  const markChallengeCompleted = async (challengeId: string) => {
    if (!user || user.challenges_completed.includes(challengeId)) return

    try {
      const updatedChallenges = [...user.challenges_completed, challengeId]
      const { error } = await supabase
        .from("users")
        .update({
          challenges_completed: updatedChallenges,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!error) {
        setUser({ ...user, challenges_completed: updatedChallenges })
      }
    } catch (err) {
      console.error("Error updating challenges:", err)
    }
  }

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
      gameOverReason: undefined,
      currentChallenge: null,
      solvedChallenges: new Set(),
      countdown: null,
    })
    setUserCode("")
    setTestResults([])
    setShowHints(false)
    setCurrentHintIndex(0)
    setShowLearningObjectives(false)
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

  // Enhanced code execution with better error handling and feedback
  const runCode = () => {
    if (!gameState.currentChallenge) return

    // Basic syntax validation with better error messages
    const codeToTest = userCode.trim()
    if (!codeToTest) {
      setTestResults([
        {
          passed: false,
          message: "No code provided",
          type: "error",
          details: "The code editor is empty. Please write some code before running tests.",
          hint: "Start by implementing the function as described in the challenge.",
          suggestion: "Look at the function template and replace 'pass' with your implementation.",
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
          suggestion: "Keep the existing function signature and just replace the 'pass' statement.",
        },
      ])
      return
    }

    if (codeToTest.includes("pass") && codeToTest.split("\n").length <= 5) {
      setTestResults([
        {
          passed: false,
          message: "Function not implemented",
          type: "error",
          details: "The function still contains 'pass' and appears to be unimplemented.",
          hint: "Replace 'pass' with your actual implementation.",
          suggestion: "Remove the 'pass' statement and add code that solves the problem.",
        },
      ])
      return
    }

    try {
      // Special handling for specific challenges with better feedback
      if (gameState.currentChallenge.id === "find-bug") {
        // More sophisticated solution check for the countdown function
        const hasDecrement = codeToTest.includes("n -= 1") || codeToTest.includes("n = n - 1")
        const hasIncrementMistake = codeToTest.includes("n += 1") || codeToTest.includes("n = n + 1")

        if (hasIncrementMistake) {
          setTestResults([
            {
              passed: false,
              message: "Incorrect operation detected",
              type: "failure",
              details: "You're incrementing 'n' instead of decrementing it. This will make the infinite loop worse!",
              hint: "You need to make 'n' smaller each iteration, not larger.",
              suggestion: "Change 'n += 1' to 'n -= 1' to count down instead of up.",
            },
          ])
          return
        }

        if (hasDecrement) {
          // Trigger success animation
          setShowSuccessAnimation(true)
          setTimeout(() => setShowSuccessAnimation(false), 3000)

          setTestResults([
            {
              passed: true,
              message: "✅ Bug fixed! All tests passed",
              type: "success",
              details: "You correctly identified and fixed the infinite loop by adding the decrement statement.",
              suggestion: "Great debugging! The loop now properly decrements 'n' each iteration.",
            },
          ])

          // Challenge solved!
          const challenge = gameState.currentChallenge

          // Find the challenge position to remove
          const challengePos = gameState.challenges.find(
            (c) => challenges[gameState.challenges.indexOf(c) % challenges.length].id === "find-bug",
          )

          setGameState((prev) => ({
            ...prev,
            currentChallenge: null,
            isPlaying: true,
            solvedChallenges: new Set([...prev.solvedChallenges, challenge.id]),
            score: prev.score + challenge.points,
            // Remove the completed challenge from the challenges array
            challenges: prev.challenges.filter((c) => c !== challengePos),
          }))

          toast({
            title: "Challenge Solved! 🎉",
            description: `+${challenge.points} points earned! You fixed the infinite loop.`,
          })

          // Reset hints
          setShowHints(false)
          setCurrentHintIndex(0)
          setShowLearningObjectives(false)
          return
        } else {
          setTestResults([
            {
              passed: false,
              message: "Infinite loop still present",
              type: "failure",
              details: "The function doesn't modify 'n' inside the loop, so the condition 'n > 0' will always be true.",
              hint: "Add a statement inside the while loop that decreases the value of 'n'.",
              suggestion: "Try adding 'n -= 1' inside the while loop, after the print statement.",
            },
          ])
          return
        }
      }

      // Enhanced evaluation for other challenges
      const results: TestResult[] = gameState.currentChallenge.testCases.map((testCase, index) => {
        try {
          // Enhanced Python to JavaScript conversion with better error handling
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
              suggestion: "Check that you haven't changed the function name from the template.",
            }
          }

          const result_value = Array.isArray(testCase.input)
            ? targetFunction(...testCase.input)
            : targetFunction(testCase.input)
          const passed = JSON.stringify(result_value) === JSON.stringify(testCase.expected)

          return {
            passed,
            message: passed
              ? `Test ${index + 1}: ✅ ${testCase.description}`
              : `Test ${index + 1}: ❌ ${testCase.description}`,
            type: passed ? "success" : "failure",
            details: passed
              ? testCase.explanation
              : `Expected: ${JSON.stringify(testCase.expected)}, Got: ${JSON.stringify(result_value)}`,
            hint: passed ? undefined : "Check your logic and try again.",
            suggestion: passed ? undefined : testCase.explanation,
          } as TestResult
        } catch (error) {
          return {
            passed: false,
            message: `Test ${index + 1}: ❌ Runtime Error`,
            type: "error",
            details: `${error}`,
            hint: "Check for syntax errors, undefined variables, or logic issues.",
            suggestion: "Review your code for typos, missing variables, or incorrect syntax.",
          } as TestResult
        }
      })

      setTestResults(results)

      const allPassed = results.every((r) => r.passed)
      if (allPassed) {
        // Challenge solved!
        const challenge = gameState.currentChallenge

        // Remove the completed challenge from the grid
        const challengePos = gameState.challenges.find(
          (c) => challenges[gameState.challenges.indexOf(c) % challenges.length].id === challenge.id,
        )

        // Trigger success animation
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)

        setGameState((prev) => ({
          ...prev,
          currentChallenge: null,
          isPlaying: true,
          solvedChallenges: new Set([...prev.solvedChallenges, challenge.id]),
          score: prev.score + challenge.points,
          // Remove the completed challenge from the challenges array
          challenges: prev.challenges.filter((c) => c !== challengePos),
        }))

        if (user) {
          markChallengeCompleted(challenge.id)
        }

        toast({
          title: "Challenge Solved! 🎉",
          description: `+${challenge.points} points earned! Excellent work!`,
        })

        // Reset hints
        setShowHints(false)
        setCurrentHintIndex(0)
        setShowLearningObjectives(false)
      }
    } catch (error) {
      setTestResults([
        {
          passed: false,
          message: "Syntax Error",
          type: "syntax",
          details: `${error}`,
          hint: "Check your Python syntax. Make sure indentation is correct and all statements are valid.",
          suggestion: "Look for missing colons, incorrect indentation, or typos in your code.",
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
    setShowLearningObjectives(false)
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

  // Debug info - remove this in production
  console.log("Render state:", {
    user: user?.username,
    authLoading,
    showLoginModal,
    showSignupModal,
  })

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
            <div className="text-xl text-rose-200 mb-2 font-mono">
              {gameState.gameOverReason === "wall"
                ? "WALL COLLISION DETECTED"
                : gameState.gameOverReason === "bug"
                  ? "SYSTEM CORRUPTED"
                  : gameState.gameOverReason === "self"
                    ? "SELF-COLLISION ERROR"
                    : "SYSTEM CORRUPTED"}
            </div>
            <div className="text-lg text-slate-300 mb-6 font-mono">
              Final Score: <span className="text-amber-400">{gameState.score}</span>
            </div>
            <div className="text-sm text-slate-400 mb-8 leading-relaxed">
              {gameState.gameOverReason === "wall"
                ? "You crashed into the system boundary! The firewall terminated your process. Stay within the grid boundaries to avoid system crashes."
                : gameState.gameOverReason === "bug"
                  ? "Your code execution failed catastrophically! Too many bugs corrupted the system. Time to debug your approach and try again."
                  : gameState.gameOverReason === "self"
                    ? "Your snake collided with itself! This caused a recursive loop error. Avoid crossing your own path to prevent stack overflow."
                    : "Your code execution failed catastrophically! Too many bugs corrupted the system. Time to debug your approach and try again."}
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

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-emerald-500/20 flex items-center justify-center z-50 backdrop-blur-sm animate-pulse">
          <div className="text-center">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-bounce">
              SUCCESS!
            </div>
            <div className="text-2xl text-emerald-200 mt-4 font-mono animate-pulse">🎉 CHALLENGE COMPLETED! 🎉</div>
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
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
                  className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                  <span className="text-xl font-bold text-amber-100">
                    {gameState.score}
                    {user && user.high_score > 0 && (
                      <span className="text-sm text-slate-300 ml-2">Best: {user.high_score}</span>
                    )}
                  </span>
                </div>

                {authLoading ? (
                  <div className="text-slate-400 text-sm">Loading...</div>
                ) : user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-200 text-sm font-mono">Hi {user.username}!</span>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      size="sm"
                      className="border-rose-500/50 text-rose-300 hover:bg-rose-500/20 hover:text-rose-100"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowLoginModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-100"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => setShowSignupModal(true)}
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
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
              move • Avoid bugs and walls or face system corruption!
            </div>
          </div>

          {/* Right Column - Challenge Area or Leaderboard */}
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
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-4 w-full text-center leading-4">
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
                      className={`font-mono text-sm bg-slate-800/80 border-emerald-500/50 h-[240px] text-emerald-100 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)] pl-10 resize-none ${showEditor ? "block" : "absolute opacity-0 pointer-events-none"}`}
                      placeholder="Write your code here..."
                      spellCheck="false"
                    />

                    {/* Syntax highlighted display */}
                    {!showEditor && (
                      <div
                        className="font-mono text-sm bg-slate-800/80 border border-emerald-500/50 h-[240px] text-emerald-100 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)] pl-10 pr-3 py-2 overflow-auto"
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
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-emerald-400/50"
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      RUN CODE
                    </Button>
                    <Button
                      onClick={showNextHint}
                      variant="outline"
                      className="border-violet-500/50 text-violet-300 hover:bg-violet-500/20 hover:text-violet-100"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      HINT
                    </Button>
                    <Button
                      onClick={closeChallenge}
                      variant="outline"
                      className="border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:text-orange-100"
                    >
                      SKIP
                    </Button>
                  </div>

                  {/* Hints Section */}
                  {showHints && gameState.currentChallenge && (
                    <div className="bg-violet-900/30 border border-violet-500/50 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="w-4 h-4 text-violet-400" />
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
              <div className="space-y-3">
                <Leaderboard />

                <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(52,211,153,0.3)] backdrop-blur-sm">
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
                            gameState.solvedChallenges.has(challenge.id) ||
                            (user && user.challenges_completed.includes(challenge.id))
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
                              {(gameState.solvedChallenges.has(challenge.id) ||
                                (user && user.challenges_completed.includes(challenge.id))) && (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="mt-4">
                        <h3 className="font-medium text-emerald-100 font-mono text-sm mb-2">PROGRESS</h3>
                        <div className="text-xs text-emerald-200 mb-1">
                          Challenges Solved: {user ? user.challenges_completed.length : gameState.solvedChallenges.size}{" "}
                          / {challenges.length}
                        </div>
                        <div className="text-xs text-emerald-200 mb-1">Bugs on Grid: {gameState.bugs.length}</div>
                        <div className="text-xs text-emerald-200">
                          Challenges Remaining: {gameState.challenges.length}
                        </div>
                        {user && <div className="text-xs text-amber-200 mt-1">High Score: {user.high_score}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-slate-400">
          <p>
            Built with ❤️ using v0 by Vercel •{" "}
            <a
              href="https://github.com/vercel/v0-code-quest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          // Refresh will be handled by auth state change
        }}
      />

      <SignupModal
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        onSuccess={() => {
          // Refresh will be handled by auth state change
        }}
      />
    </div>
  )
}
