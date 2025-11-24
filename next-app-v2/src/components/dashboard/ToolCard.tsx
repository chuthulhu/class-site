interface ToolCardProps {
  title: string;
  icon: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

export default function ToolCard({ title, icon, description, buttonText, onAction }: ToolCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{icon}</span>
        <h4 className="font-medium text-gray-800">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={onAction}
        className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        {buttonText}
      </button>
    </div>
  );
}
