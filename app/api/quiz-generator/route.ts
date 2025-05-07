import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Mock function to generate computer networks related quiz questions
async function generateQuizFromFiles(filesPaths: string[]) {
  console.log("Generating quiz from files:", filesPaths);
  
  // Hard-coded computer networks related questions
  const networkQuestions = [
    {
      id: 1,
      question: "Which protocol is used for secure communication over a computer network?",
      options: [
        { id: 'a', text: 'HTTP' },
        { id: 'b', text: 'HTTPS' },
        { id: 'c', text: 'FTP' },
        { id: 'd', text: 'SMTP' },
      ],
      correctAnswer: 'b',
      explanation: 'HTTPS (Hypertext Transfer Protocol Secure) is used for secure communication over a computer network and is widely used on the Internet.'
    },
    {
      id: 2,
      question: "What does OSI stand for in networking?",
      options: [
        { id: 'a', text: 'Open Source Internet' },
        { id: 'b', text: 'Operating System Interface' },
        { id: 'c', text: 'Open Systems Interconnection' },
        { id: 'd', text: 'Optical System Integration' },
      ],
      correctAnswer: 'c',
      explanation: 'OSI stands for Open Systems Interconnection. It is a conceptual model that standardizes the communication functions of a telecommunication or computing system.'
    },
    {
      id: 3,
      question: "Which layer of the OSI model is responsible for logical addressing and routing?",
      options: [
        { id: 'a', text: 'Network Layer' },
        { id: 'b', text: 'Transport Layer' },
        { id: 'c', text: 'Data Link Layer' },
        { id: 'd', text: 'Session Layer' },
      ],
      correctAnswer: 'a',
      explanation: 'The Network Layer (Layer 3) is responsible for logical addressing and routing. IP (Internet Protocol) operates at this layer.'
    },
    {
      id: 4,
      question: "What is the primary function of a router in a network?",
      options: [
        { id: 'a', text: 'Signal amplification' },
        { id: 'b', text: 'Packet forwarding between different networks' },
        { id: 'c', text: 'Error detection' },
        { id: 'd', text: 'Data encryption' },
      ],
      correctAnswer: 'b',
      explanation: 'Routers forward packets between different networks. They operate at the Network Layer and make decisions based on IP addresses.'
    },
    {
      id: 5,
      question: "Which of the following is NOT a private IP address range?",
      options: [
        { id: 'a', text: '10.0.0.0 to 10.255.255.255' },
        { id: 'b', text: '172.16.0.0 to 172.31.255.255' },
        { id: 'c', text: '192.168.0.0 to 192.168.255.255' },
        { id: 'd', text: '8.8.8.0 to 8.8.8.255' },
      ],
      correctAnswer: 'd',
      explanation: '8.8.8.0 to 8.8.8.255 is not a private IP address range. The private IP ranges are 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 as defined by RFC 1918.'
    }
  ];
  
  // Select between 4-5 random questions
  const numQuestions = Math.floor(Math.random() * 2) + 4; // 4 or 5 questions
  const shuffledQuestions = [...networkQuestions].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffledQuestions.slice(0, numQuestions);
  
  return {
    title: "Computer Networks Quiz",
    description: `Quiz generated from ${filesPaths.length} file(s) related to Computer Networks`,
    questions: selectedQuestions,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePaths, courseId } = body;
    
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return NextResponse.json(
        { error: "No files provided for quiz generation" },
        { status: 400 }
      );
    }
    
    // Generate quiz using mock computer networks questions
    const quiz = await generateQuizFromFiles(filePaths);
    
    // Store the generated quiz in the database (optional)
    // const supabase = await createClient();
    // const { data, error } = await supabase
    //   .from('quizzes')
    //   .insert({
    //     course_id: courseId,
    //     title: quiz.title,
    //     description: quiz.description,
    //     questions: quiz.questions
    //   })
    //   .select();
    
    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
} 