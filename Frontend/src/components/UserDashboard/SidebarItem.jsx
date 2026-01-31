const SidebarItem = ({ label, value, activeTab, setActiveTab, icon: Icon }) => {

    return (
        <li
        onClick={() => setActiveTab(value)}
        className={`
            flex items-center gap-3 px-3 sm:px-4 py-3 rounded-md cursor-pointer
            transition group relative

            ${
            activeTab === value
                ? "bg-[#FF8F9C] text-white"
                : "text-[#787878] hover:bg-gray-100"
            }
        `}
        >
        {/* Icon */}
        {Icon && <Icon className="text-xl sm:text-2xl flex-shrink-0" />}
        
        {/* Label - hidden on small screens, visible on md+ */}
        <span className="hidden md:block">{label}</span>
        
        {/* Tooltip for mobile */}
        <span className="md:hidden absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
        </li>
    );
};

export default SidebarItem;
