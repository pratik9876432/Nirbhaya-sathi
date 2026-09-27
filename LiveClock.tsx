import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock({ showIcon = false, className = "" }: { showIcon?: boolean, className?: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  return (
    <div className={`flex items-center gap-2 font-medium ${className}`}>
      {showIcon && <Clock size={16} />}
      <span>{time.toLocaleString(undefined, formatOptions)}</span>
    </div>
  );
}
