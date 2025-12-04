interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
      {text && <span className="text-base-content/70">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

