import { format, addDays, isWeekend } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付データを生成する関数
export const generateDates = (startDate: Date, days: number = 7) => {
  const dates = [];
  const dayOfWeekMap = ['日', '月', '火', '水', '木', '金', '土'];

  // 現在の日付から最も近い火曜日を見つける
  const currentDay = startDate.getDay(); // 0=日, 1=月, 2=火, ...
  const daysUntilTuesday = (currentDay <= 2) ? (2 - currentDay) : (9 - currentDay);
  const tuesdayDate = addDays(startDate, daysUntilTuesday);
  
  for (let i = 0; i < days; i++) {
    const date = addDays(tuesdayDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    const display = format(date, 'M/d');

    dates.push({
      date: dateStr,
      dayOfWeek,
      display,
    });
  }

  return dates;
};

// 利用可能状態の型定義
interface Availability {
  [key: string]: boolean;
}

// ダミーのアサインメントデータを生成する関数
export const generateDummyAssignments = () => {
  const now = new Date();
  const dates = generateDates(now);
  
  // 利用可能曜日を設定（全て利用可能にする）
  const generateAvailability = (): Availability => {
    const availability: Availability = {};
    dates.forEach(date => {
      // すべてのセルを利用可能に設定
      availability[date.date] = true;
    });
    return availability;
  };

  return [
    {
      id: 'assign1',
      agency: 'ピーアップ',
      venue: 'イオンモール上尾センターコート',
      venueDetail: '埼玉県上尾市愛宕3丁目8-1',
      hasTrip: false,
      isOutdoor: false,
      orders: [
        { id: 'order1', name: 'クローザー', isGirl: false },
        { id: 'order2', name: 'クローザー', isGirl: false },
        { id: 'order3', name: 'ガール', isGirl: true },
        { id: 'order4', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign2',
      agency: 'ピーアップ',
      venue: 'イトーヨーカドー立場店',
      venueDetail: '神奈川県横浜市泉区中田西1-1-15',
      hasTrip: true,
      isOutdoor: false,
      orders: [
        { id: 'order5', name: 'クローザー', isGirl: false },
        { id: 'order6', name: 'クローザー', isGirl: false },
        { id: 'order7', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign3',
      agency: 'ピーアップ',
      venue: 'マルエツ松江',
      venueDetail: '神奈川県横浜市戸塚区松永町11-7',
      hasTrip: false,
      isOutdoor: true,
      orders: [
        { id: 'order8', name: 'クローザー', isGirl: false },
        { id: 'order9', name: 'ガール', isGirl: true },
        { id: 'order10', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign4',
      agency: 'ピーアップ',
      venue: 'コーナン西新井',
      venueDetail: '東京都足立区江北7-17-13',
      hasTrip: false,
      isOutdoor: false,
      orders: [
        { id: 'order11', name: 'クローサー', isGirl: false },
        { id: 'order12', name: 'クローサー', isGirl: false },
        { id: 'order13', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign5',
      agency: 'ラネット',
      venue: '錦糸町マルイ たい焼き屋前',
      venueDetail: '東京都墨田区江東橋3-9-10',
      hasTrip: false,
      isOutdoor: true,
      orders: [
        { id: 'order14', name: 'クローザー', isGirl: false },
        { id: 'order15', name: 'ガール', isGirl: true },
        { id: 'order16', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign6',
      agency: 'ラネット',
      venue: 'ららぽーと富士見 1階スリコ前',
      venueDetail: '埼玉県富士見市山室1-1313',
      hasTrip: true,
      isOutdoor: false,
      orders: [
        { id: 'order17', name: 'クローザー', isGirl: false },
        { id: 'order18', name: 'クローザー', isGirl: false },
      ],
      availability: generateAvailability(),
    },
  ];
}; 