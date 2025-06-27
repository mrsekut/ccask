import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import type { Question } from './types.js';
import type { Screen } from '../navigation/types.js';

type Props = {
  question: Question;
  onNavigate: (screen: Screen) => void;
};

const copyToClipboard = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn('pbcopy', [], { stdio: ['pipe', 'ignore', 'ignore'] });

    child.stdin?.write(text);
    child.stdin?.end();

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pbcopy failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

export function QuestionDetail({ question, onNavigate }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (question.status !== 'completed' || !question.filepath) {
        setContent(null);
        return;
      }

      try {
        if (!existsSync(question.filepath)) {
          setError(`File not found: ${question.filepath}`);
          return;
        }

        const fileContent = await readFile(question.filepath, 'utf-8');
        setContent(fileContent);
        setError(null);
      } catch (err) {
        setError(
          `Failed to read file: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`,
        );
      }
    };

    loadContent();
  }, [question]);

  useInput(async input => {
    if (input === 'c' && content) {
      try {
        await copyToClipboard(content);
        setCopyMessage('✓ Copied to clipboard!');
        setTimeout(() => setCopyMessage(null), 2000);
      } catch (err) {
        setCopyMessage(
          `✗ Copy failed: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`,
        );
        setTimeout(() => setCopyMessage(null), 3000);
      }
    } else if (input === 'l') {
      onNavigate('list');
    }
  });

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={1}>
        <Text bold>Question Details:</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>
          <Text bold>Term:</Text> {question.term}
        </Text>
        <Text>
          <Text bold>Status:</Text> {question.status}
        </Text>
        <Text>
          <Text bold>Created:</Text>{' '}
          {new Date(question.createdAt).toLocaleString()}
        </Text>
        {question.startedAt && (
          <Text>
            <Text bold>Started:</Text>{' '}
            {new Date(question.startedAt).toLocaleString()}
          </Text>
        )}
        {question.completedAt && (
          <Text>
            <Text bold>Completed:</Text>{' '}
            {new Date(question.completedAt).toLocaleString()}
          </Text>
        )}
        {question.filepath && (
          <Text>
            <Text bold>File:</Text> {question.filepath}
          </Text>
        )}
        {question.error && (
          <Text color="red">
            <Text bold>Error:</Text> {question.error}
          </Text>
        )}
      </Box>

      {copyMessage && (
        <Box marginBottom={1}>
          <Text color={copyMessage.startsWith('✓') ? 'green' : 'red'}>
            {copyMessage}
          </Text>
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}

      {question.status !== 'completed' && !question.filepath && (
        <Box marginBottom={1}>
          <Text color="yellow">Explanation not generated yet</Text>
        </Box>
      )}

      {content && (
        <Box
          flexDirection="column"
          borderStyle="single"
          paddingX={1}
          paddingY={1}
        >
          <Box marginBottom={1}>
            <Text bold>Content:</Text>
          </Box>
          <Text>{content}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {content ? 'c: Copy to clipboard | ' : ''}l: Back to list | ESC: Menu
        </Text>
      </Box>
    </Box>
  );
}
