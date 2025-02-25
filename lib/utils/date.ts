export const calculateTimeRemaining = (dueDate: Date) => {
  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  
  if (timeDiff < 0) {
    // Assignment is overdue
    const overdueDiff = Math.abs(timeDiff);
    const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days ${hours} hours`;
  } else {
    // Time remaining
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days ${hours} hours remaining`;
  }
}; 