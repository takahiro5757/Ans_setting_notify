/**
 * 指定された年月の週情報を取得します
 * @param year 年（文字列）
 * @param month 月（文字列）
 * @returns 週情報の配列
 */
export const getWeeks = (year: string, month: string): string[] => {
  const numYear = parseInt(year);
  const numMonth = parseInt(month);
  
  // 月の最初の日を取得
  const firstDay = new Date(numYear, numMonth - 1, 1);
  // 月の最後の日を取得
  const lastDay = new Date(numYear, numMonth, 0);
  
  // 週情報の配列を初期化
  const weeks: string[] = [];
  
  // 現在の日付
  let currentDate = new Date(firstDay);
  
  // 月の最初の週の開始日を設定
  const firstWeekStart = new Date(currentDate);
  // 日曜日(0)になるまで日付を減らす
  while (firstWeekStart.getDay() !== 0) {
    firstWeekStart.setDate(firstWeekStart.getDate() - 1);
  }
  
  // 週ごとに処理
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    // 週の開始日
    const weekStart = new Date(firstWeekStart);
    weekStart.setDate(firstWeekStart.getDate() + (weekIndex * 7));
    
    // 週の終了日
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // この週が指定された月に含まれるかチェック
    if (
      (weekStart.getMonth() + 1 === numMonth || weekEnd.getMonth() + 1 === numMonth) ||
      (weekStart.getDate() <= lastDay.getDate() && weekStart.getMonth() === numMonth - 1)
    ) {
      // 表示用の日付文字列を作成
      const weekStartStr = formatDate(weekStart);
      const weekEndStr = formatDate(weekEnd);
      weeks.push(`${weekStartStr}～${weekEndStr}`);
    }
    
    // 月の最終日を超えたら終了
    if (weekEnd > lastDay && weekEnd.getMonth() !== numMonth - 1) {
      break;
    }
  }
  
  return weeks;
};

/**
 * 日付を'MM/DD'形式にフォーマットします
 * @param date 日付オブジェクト
 * @returns フォーマットされた日付文字列
 */
const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

/**
 * ダミーのサマリーデータを生成します
 * @returns サマリーデータ
 */
export const generateDummySummary = () => {
  return {
    closerCapacity: [30, 30, 30, 30, 30, 30],
    girlCapacity: [20, 20, 20, 20, 20, 20],
    totalCapacity: [50, 50, 50, 50, 50, 50]
  };
}; 