import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainFeature from '../components/MainFeature'

const Home = () => {
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])

  const addToHistory = (calculation) => {
    setHistory(prev => [calculation, ...prev].slice(0, 10))
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
          CalcuSwift
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Perform calculations with speed and precision
        </p>
      </motion.div>

      <div className="relative">
        <MainFeature onCalculation={addToHistory} />
        
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={() => setShowHistory(prev => !prev)}
            className="text-sm font-medium text-primary dark:text-primary-light hover:underline"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-sm font-medium text-accent hover:underline"
            >
              Clear History
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4 shadow-card">
                <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Calculation History
                </h3>
                
                {history.length === 0 ? (
                  <p className="text-surface-500 dark:text-surface-400 text-sm italic">
                    No calculations yet
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                    {history.map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center text-sm p-2 rounded bg-surface-50 dark:bg-surface-700"
                      >
                        <span className="text-surface-700 dark:text-surface-300">{item.expression}</span>
                        <span className="font-medium">{item.result}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Home