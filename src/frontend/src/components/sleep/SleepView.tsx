import SleepLogForm from './SleepLogForm';
import SleepHistoryList from './SleepHistoryList';

export default function SleepView() {
  return (
    <div className="space-y-4">
      <SleepLogForm />
      <SleepHistoryList />
    </div>
  );
}
