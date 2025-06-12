const Sidebar = () => {
  return (
    <aside
      className={`fixed bg-sidebar-primary text-sidebar-foreground border-muted left-0 top-16 h-[calc(100vh-4rem)]  border-r  flex flex-col transition-all duration-300 `}
    ></aside>
  );
};

export default Sidebar;
