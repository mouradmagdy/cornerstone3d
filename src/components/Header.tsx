const Header = () => {
  return (
    <header className="flex bg-sidebar-background text-sidebar-foreground border-muted  justify-between items-center px-6 py-2 top-0 left-0 right-0 z-10  border-b border-l  transition-all duration-300">
      <div className="flex items-center gap-2">
        <img src="vite.svg" alt="Logo" className="w-10 h-10" />
        <h1 className="text-lg font-semibold ">Cornerstone</h1>
      </div>
    </header>
  );
};

export default Header;
