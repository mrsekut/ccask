import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { getAllQuestions } from './questionManager.js';
import { formatStatus } from './formatters.js';
import type { Question } from './types.js';
import type { Screen, AppState } from '../navigation/types.js';

type Props = {
  questions: Question[];
  onNavigate: (screen: Screen, question?: Question) => void;
  onUpdateQuestions: (questions: Question[]) => void;
};

export function QuestionList({
  questions,
  onNavigate,
  onUpdateQuestions,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load questions on mount and periodically refresh
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const allQuestions = await getAllQuestions();
        onUpdateQuestions(allQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    loadQuestions();
    const interval = setInterval(loadQuestions, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, [onUpdateQuestions]);

  // Calculate stats
  const stats = {
    pending: questions.filter(q => q.status === 'pending').length,
    generating: questions.filter(q => q.status === 'generating').length,
    completed: questions.filter(q => q.status === 'completed').length,
    failed: questions.filter(q => q.status === 'failed').length,
  };

  useInput((input, key) => {
    if (key.upArrow && questions.length > 0) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : questions.length - 1));
      return;
    }

    if (key.downArrow && questions.length > 0) {
      setSelectedIndex(prev => (prev < questions.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return && questions.length > 0 && questions[selectedIndex]) {
      onNavigate('detail', questions[selectedIndex]);
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={1}>
        <Text bold>Questions ({new Date().toLocaleString()})</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>
          📈 Stats: Pending: {stats.pending} | Generating: {stats.generating} |
          Completed: {stats.completed} | Failed: {stats.failed}
        </Text>
      </Box>

      {questions.length === 0 ? (
        <Text>No questions found</Text>
      ) : (
        <Box flexDirection="column">
          {questions.map((question, index) => (
            <Box key={question.id} marginBottom={1}>
              <Text color={index === selectedIndex ? 'green' : 'white'}>
                {index === selectedIndex ? '→ ' : '  '}
                {formatStatus(question.status)} {question.term}
              </Text>
              {index === selectedIndex && (
                <Text dimColor> (Press Enter to view details)</Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Enter: View details</Text>
      </Box>
    </Box>
  );
}
