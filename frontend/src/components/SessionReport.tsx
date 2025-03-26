const questions = [...aiQuestions]; // Clone to avoid mutations
console.log("Question details before submission:");
questions.forEach((q, i) => {
  console.log(`Question ${i+1} - Type: ${q.type || q.questionType}`);
  console.log(`  - Term: ${q.itemInfo?.term || 'unknown'}`);
  console.log(`  - Answer: ${q.answer || q.correctAnswer || 'unknown'}`);
  console.log(`  - Fields:`, Object.keys(q));
});

// Before sending to backend
console.log("First identification question payload:", 
  questions.find(q => q.type === 'identification' || q.questionType === 'identification')); 