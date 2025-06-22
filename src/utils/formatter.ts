import type { Question } from "../types/index.js";

export const formatDuration = (start: string, end: string): string => {
	const durationMs = new Date(end).getTime() - new Date(start).getTime();
	const seconds = Math.floor(durationMs / 1000);
	const minutes = Math.floor(seconds / 60);

	if (minutes > 0) {
		return `${minutes}分${seconds % 60}秒`;
	}
	return `${seconds}秒`;
};

export const formatStatus = (status: Question["status"]): string => {
	const statusMap = {
		pending: "⏳ 待機中",
		generating: "🔄 生成中",
		completed: "✅ 完了",
		failed: "❌ 失敗",
	};
	return statusMap[status] || status;
};

export const formatQuestion = (question: Question): string => {
	let output = `[${question.id}] ${question.term}\n`;
	output += `  状態: ${formatStatus(question.status)}\n`;
	output += `  作成: ${new Date(question.createdAt).toLocaleString("ja-JP")}\n`;

	if (question.startedAt) {
		output += `  開始: ${new Date(question.startedAt).toLocaleString(
			"ja-JP"
		)}\n`;
	}

	if (question.completedAt && question.startedAt) {
		const duration = formatDuration(question.startedAt, question.completedAt);
		output += `  完了: ${new Date(question.completedAt).toLocaleString(
			"ja-JP"
		)} (${duration})\n`;
	}

	if (question.filepath) {
		output += `  ファイル: ${question.filepath}\n`;
	}

	if (question.error) {
		output += `  エラー: ${question.error}\n`;
	}

	return output;
};
