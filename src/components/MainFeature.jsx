import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, X, Divide, Percent, Calculator, Trash2, Delete, RefreshCw, Save, RotateCcw } from 'lucide-react'

const MainFeature = ({ onCalculation }) => {
  // Calculator state
  const [displayValue, setDisplayValue] = useState('0')
  const [currentInput, setCurrentInput] = useState('')
  const [previousOperand, setPreviousOperand] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [memoryValue, setMemoryValue] = useState(0)
  const [showMemory, setShowMemory] = useState(false)
  const [lastAction, setLastAction] = useState('')
  
  // Handle number input
  const handleNumberInput = (number) => {
    if (waitingForOperand) {
      setDisplayValue(String(number))
      setCurrentInput(String(number))
      setWaitingForOperand(false)
      setLastAction(`Entered ${number}`)
    } else {
      // Don't allow multiple zeros at the start
      if (displayValue === '0' && number === 0) return
      
      // Replace the initial zero
      if (displayValue === '0') {
        setDisplayValue(String(number))
        setCurrentInput(String(number))
      } else {
        setDisplayValue(displayValue + number)
        setCurrentInput(currentInput + number)
      }
      setLastAction(`Entered ${number}`)
    }
  }
  
  // Handle decimal point
  const handleDecimalPoint = () => {
    if (waitingForOperand) {
      setDisplayValue('0.')
      setCurrentInput('0.')
      setWaitingForOperand(false)
      setLastAction('Added decimal point')
      return
    }
    
    // Don't add another decimal point if one already exists
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.')
      setCurrentInput(currentInput + '.')
      setLastAction('Added decimal point')
    }
  }
  
  // Handle operations
  const handleOperation = (nextOperation) => {
    const inputValue = parseFloat(displayValue)
    
    if (previousOperand === null) {
      setPreviousOperand(inputValue)
    } else if (operation) {
      const result = performCalculation()
      setPreviousOperand(result)
      setDisplayValue(String(result))
      
      // Add to calculation history
      if (onCalculation) {
        onCalculation({
          expression: `${previousOperand} ${getOperationSymbol(operation)} ${inputValue}`,
          result: result
        })
      }
    }
    
    setWaitingForOperand(true)
    setOperation(nextOperation)
    setLastAction(`Operation: ${getOperationSymbol(nextOperation)}`)
  }
  
  // Get operation symbol for display
  const getOperationSymbol = (op) => {
    switch(op) {
      case 'add': return '+'
      case 'subtract': return '-'
      case 'multiply': return '×'
      case 'divide': return '÷'
      case 'percent': return '%'
      case 'sqrt': return '√'
      default: return ''
    }
  }
  
  // Perform calculation based on current operation
  const performCalculation = () => {
    const inputValue = parseFloat(displayValue)
    
    if (isNaN(previousOperand) || isNaN(inputValue)) return inputValue
    
    let result
    switch(operation) {
      case 'add':
        result = previousOperand + inputValue
        break
      case 'subtract':
        result = previousOperand - inputValue
        break
      case 'multiply':
        result = previousOperand * inputValue
        break
      case 'divide':
        if (inputValue === 0) {
          return 'Error'
        }
        result = previousOperand / inputValue
        break
      case 'percent':
        result = previousOperand * (inputValue / 100)
        break
      default:
        return inputValue
    }
    
    // Format the result to avoid floating point issues
    return Math.round(result * 1000000) / 1000000
  }
  
  // Handle equals button
  const handleEquals = () => {
    if (!operation || previousOperand === null) return
    
    const inputValue = parseFloat(displayValue)
    const result = performCalculation()
    
    // Add to calculation history
    if (onCalculation) {
      onCalculation({
        expression: `${previousOperand} ${getOperationSymbol(operation)} ${inputValue} =`,
        result: result
      })
    }
    
    setDisplayValue(String(result))
    setCurrentInput(String(result))
    setPreviousOperand(null)
    setOperation(null)
    setWaitingForOperand(true)
    setLastAction('Calculated result')
  }
  
  // Handle special functions
  const handleSpecialFunction = (func) => {
    const inputValue = parseFloat(displayValue)
    
    switch(func) {
      case 'sqrt':
        if (inputValue < 0) {
          setDisplayValue('Error')
          setLastAction('Error: Cannot calculate square root of negative number')
          return
        }
        const sqrtResult = Math.sqrt(inputValue)
        setDisplayValue(String(sqrtResult))
        setCurrentInput(String(sqrtResult))
        
        // Add to calculation history
        if (onCalculation) {
          onCalculation({
            expression: `√(${inputValue})`,
            result: sqrtResult
          })
        }
        setLastAction('Calculated square root')
        break
        
      case 'percent':
        const percentResult = inputValue / 100
        setDisplayValue(String(percentResult))
        setCurrentInput(String(percentResult))
        setLastAction('Converted to percentage')
        break
        
      case 'negate':
        const negateResult = -inputValue
        setDisplayValue(String(negateResult))
        setCurrentInput(String(negateResult))
        setLastAction('Negated value')
        break
        
      default:
        break
    }
    
    setWaitingForOperand(true)
  }
  
  // Handle clear
  const handleClear = () => {
    setDisplayValue('0')
    setCurrentInput('')
    setPreviousOperand(null)
    setOperation(null)
    setWaitingForOperand(false)
    setLastAction('Cleared calculator')
  }
  
  // Handle backspace
  const handleBackspace = () => {
    if (waitingForOperand) return
    
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0')
      setCurrentInput('0')
    } else {
      setDisplayValue(displayValue.slice(0, -1))
      setCurrentInput(currentInput.slice(0, -1))
    }
    setLastAction('Deleted last digit')
  }
  
  // Memory functions
  const handleMemory = (action) => {
    const currentValue = parseFloat(displayValue)
    
    switch(action) {
      case 'add':
        setMemoryValue(memoryValue + currentValue)
        setLastAction('Added to memory')
        break
      case 'subtract':
        setMemoryValue(memoryValue - currentValue)
        setLastAction('Subtracted from memory')
        break
      case 'recall':
        setDisplayValue(String(memoryValue))
        setCurrentInput(String(memoryValue))
        setWaitingForOperand(true)
        setLastAction('Recalled from memory')
        break
      case 'clear':
        setMemoryValue(0)
        setLastAction('Cleared memory')
        break
      default:
        break
    }
    
    // Show memory indicator briefly
    setShowMemory(true)
    setTimeout(() => setShowMemory(false), 1500)
  }
  
  // Button variants
  const buttonVariants = {
    tap: { scale: 0.95 }
  }
  
  return (
    <div className="relative">
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 right-2 bg-primary text-white text-xs px-2 py-1 rounded-md"
          >
            Memory: {memoryValue}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="dark:neumorphic-dark neumorphic-light rounded-2xl p-5 overflow-hidden">
        {/* Last action display */}
        <div className="h-6 mb-1 text-xs text-surface-500 dark:text-surface-400 text-right overflow-hidden">
          {lastAction}
        </div>
        
        {/* Calculator display */}
        <div className="calc-display mb-4">
          <div className="text-sm text-surface-500 dark:text-surface-400 h-5 overflow-hidden">
            {previousOperand !== null ? 
              `${previousOperand} ${getOperationSymbol(operation)}` : ''}
          </div>
          <div className="text-3xl font-bold text-surface-900 dark:text-surface-50 overflow-x-auto scrollbar-hide">
            {displayValue}
          </div>
        </div>
        
        {/* Memory and clear buttons */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleMemory('clear')}
            className="calc-button-function"
            aria-label="Memory clear"
          >
            MC
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleMemory('recall')}
            className="calc-button-function"
            aria-label="Memory recall"
          >
            MR
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleMemory('add')}
            className="calc-button-function"
            aria-label="Memory add"
          >
            M+
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleMemory('subtract')}
            className="calc-button-function"
            aria-label="Memory subtract"
          >
            M-
          </motion.button>
        </div>
        
        {/* Calculator buttons */}
        <div className="grid grid-cols-4 gap-3">
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={handleClear}
            className="calc-button-operation"
            aria-label="Clear"
          >
            <Trash2 size={18} />
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleSpecialFunction('sqrt')}
            className="calc-button-operation"
            aria-label="Square root"
          >
            <Calculator size={18} />
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleSpecialFunction('percent')}
            className="calc-button-operation"
            aria-label="Percent"
          >
            <Percent size={18} />
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={handleBackspace}
            className="calc-button-operation"
            aria-label="Backspace"
          >
            <Delete size={18} />
          </motion.button>
          
          {/* Numbers and operations */}
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(7)}
            className="calc-button-number"
          >
            7
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(8)}
            className="calc-button-number"
          >
            8
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(9)}
            className="calc-button-number"
          >
            9
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleOperation('divide')}
            className="calc-button-operation"
            aria-label="Divide"
          >
            <Divide size={18} />
          </motion.button>
          
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(4)}
            className="calc-button-number"
          >
            4
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(5)}
            className="calc-button-number"
          >
            5
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(6)}
            className="calc-button-number"
          >
            6
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleOperation('multiply')}
            className="calc-button-operation"
            aria-label="Multiply"
          >
            <X size={18} />
          </motion.button>
          
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(1)}
            className="calc-button-number"
          >
            1
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(2)}
            className="calc-button-number"
          >
            2
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(3)}
            className="calc-button-number"
          >
            3
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleOperation('subtract')}
            className="calc-button-operation"
            aria-label="Subtract"
          >
            <Minus size={18} />
          </motion.button>
          
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleSpecialFunction('negate')}
            className="calc-button-number"
            aria-label="Negate"
          >
            <RotateCcw size={18} />
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleNumberInput(0)}
            className="calc-button-number"
          >
            0
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={handleDecimalPoint}
            className="calc-button-number"
            aria-label="Decimal point"
          >
            .
          </motion.button>
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={() => handleOperation('add')}
            className="calc-button-operation"
            aria-label="Add"
          >
            <Plus size={18} />
          </motion.button>
          
          {/* Equals button (full width) */}
          <motion.button 
            whileTap="tap"
            variants={buttonVariants}
            onClick={handleEquals}
            className="calc-button-equals col-span-4 mt-3 py-3"
            aria-label="Equals"
          >
            =
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default MainFeature