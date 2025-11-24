interface StatusCardProps {
  icon: string;
  bgColorClass: string;
  title: string;
  value: string;
}

export default function StatusCard({ icon, bgColorClass, title, value }: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgColorClass}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
