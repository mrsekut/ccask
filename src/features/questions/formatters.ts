import type { Question } from './types.js';

const formatDuration = (start: string, end: string): string => {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  }
  return `${seconds}秒`;
};

export const formatStatus = (status: Question['status']): string => {
  const statusMap = {
    pending: '⏳ 待機中',
    generating: '🔄 生成中',
    completed: '✅ 完了',
    failed: '❌ 失敗',
  };
  return statusMap[status] || status;
};

const formatDate = (date: string): string =>
  new Date(date).toLocaleString('ja-JP');

const formatStartedInfo = (startedAt: string | undefined): string =>
  startedAt ? `  開始: ${formatDate(startedAt)}\n` : '';

const formatCompletedInfo = (
  completedAt: string | undefined,
  startedAt: string | undefined,
): string =>
  completedAt && startedAt
    ? `  完了: ${formatDate(completedAt)} (${formatDuration(
        startedAt,
        completedAt,
      )})\n`
    : '';

const formatFilepath = (filepath: string | undefined): string =>
  filepath ? `  ファイル: ${filepath}\n` : '';

const formatError = (error: string | undefined): string =>
  error ? `  エラー: ${error}\n` : '';

export const formatQuestion = (question: Question): string => {
  const baseInfo = [
    `[${question.id}] ${question.term}`,
    `  状態: ${formatStatus(question.status)}`,
    `  作成: ${formatDate(question.createdAt)}`,
  ].join('\n');

  return [
    baseInfo,
    formatStartedInfo(question.startedAt),
    formatCompletedInfo(question.completedAt, question.startedAt),
    formatFilepath(question.filepath),
    formatError(question.error),
  ]
    .filter(Boolean)
    .join(
      question.startedAt || question.filepath || question.error ? '' : '\n',
    );
};
