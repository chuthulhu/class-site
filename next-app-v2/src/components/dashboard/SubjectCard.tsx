interface SubjectCardProps {
  title: string;
  icon: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string; // e.g., 'text-indigo-100'
  children: React.ReactNode;
}

export default function SubjectCard({
  title,
  icon,
  description,
  gradientFrom,
  gradientTo,
  textColor,
  children,
}: SubjectCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-white`}>
        <div className="flex items-center">
          <span className="text-3xl mr-3">{icon}</span>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className={`${textColor} text-sm`}>{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
