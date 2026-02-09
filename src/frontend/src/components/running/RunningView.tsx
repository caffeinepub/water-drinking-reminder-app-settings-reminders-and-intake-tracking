import RunLogForm from './RunLogForm';
import RunHistoryList from './RunHistoryList';

export default function RunningView() {
  return (
    <div className="space-y-4">
      <RunLogForm />
      <RunHistoryList />
    </div>
  );
}
