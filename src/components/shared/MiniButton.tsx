function MiniButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`py-1 px-3 rounded-sm text-sm hover:bg-black/10 transition-colors duration-200 bg-black/5 dark:bg-white/5 dark:hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default MiniButton
