import { SurveySet } from '../types';

export const surveyQuestions: Record<string, SurveySet> = {
  Teacher: {
    role: 'Teacher',
    intro: "Thanks for trying the demo! You know your classroom better than anyone, so we'd like to hear about your day-to-day, not just what you think of our app. A few short questions.",
    intro_audio: "Thanks for trying the demo! You know your classroom better than anyone, so we'd like to hear about your day-to-day, not just what you think of our app. A few short questions.",
    questions: [
      {
        type: 'mcq',
        id: 'teacher_q1',
        prompt: "Think about the last chapter you finished teaching. How did you find out which students hadn't understood it?",
        audio: "Think about the last chapter you finished teaching. How did you find out which students hadn't understood it?",
        options: ["I gave a class test or quiz", "I asked questions in class", "I checked notebooks or homework", "A parent or another teacher told me", "I only found out at exam time"],
      },
      {
        type: 'mcq',
        id: 'teacher_q2',
        prompt: "In a typical week, how many hours do you spend checking and grading work outside class time?",
        audio: "In a typical week, how many hours do you spend checking and grading work outside class time?",
        options: ["Less than 2 hours", "2 to 5 hours", "5 to 10 hours", "More than 10 hours"],
      },
      {
        type: 'mcq',
        id: 'teacher_q3',
        prompt: "What do you mainly use today to keep track of how each student is doing?",
        audio: "What do you mainly use today to keep track of how each student is doing?",
        options: ["Notebooks and registers", "Excel or Google Sheets", "The school's ERP or app", "An app I picked myself", "Nothing formal"],
      },
      {
        type: 'mcq',
        id: 'teacher_q4',
        prompt: "How do you record which skills or competencies a lesson or test covers, for example under NCF 2023?",
        audio: "How do you record which skills or competencies a lesson or test covers, for example under NCF 2023?",
        options: ["I don't, nobody has asked for it", "I fill in a format the school gives me, by hand", "Our school software does it", "I'm not familiar with NCF 2023"],
      },
      {
        type: 'text',
        id: 'teacher_q5',
        prompt: "What is the most frustrating part of finding out which students are struggling?",
        audio: "What is the most frustrating part of finding out which students are struggling?",
        placeholder: "Type a few words, or skip",
        optional: true,
      }
    ]
  },
  Principal: {
    role: 'Principal',
    intro: "Thanks for exploring the demo! We'd love a school leader's view, mostly about how things work at your school today. A few short questions.",
    intro_audio: "Thanks for exploring the demo! We'd love a school leader's view, mostly about how things work at your school today. A few short questions.",
    questions: [
      {
        type: 'mcq',
        id: 'principal_q1',
        prompt: "How did you find out how well students were learning during the last term?",
        audio: "How did you find out how well students were learning during the last term?",
        options: ["Exam results and report cards", "Meetings with teachers", "Reports from our school software", "Feedback or complaints from parents", "Mostly I didn't, until exam time"],
      },
      {
        type: 'mcq',
        id: 'principal_q2',
        prompt: "How is your school getting ready for NCF 2023 and its competency-based approach?",
        audio: "How is your school getting ready for NCF 2023 and its competency-based approach?",
        options: ["Training our teachers", "Changing how we set tests", "Using software to track competencies", "We haven't started yet", "I'm not sure what is required"],
      },
      {
        type: 'mcq',
        id: 'principal_q3',
        prompt: "When your school last adopted a new learning tool, who made the final decision?",
        audio: "When your school last adopted a new learning tool, who made the final decision?",
        options: ["I did", "Management or trustees", "A committee that included teachers", "Department heads recommended and I approved", "We haven't adopted one recently"],
      },
      {
        type: 'mcq',
        id: 'principal_q4',
        prompt: "What was the biggest hurdle the last time you introduced a new tool or software?",
        audio: "What was the biggest hurdle the last time you introduced a new tool or software?",
        options: ["Teachers needed training or resisted", "Cost and budget", "Students got distracted", "It didn't fit our existing systems", "Parents had concerns", "We haven't introduced one"],
      },
      {
        type: 'text',
        id: 'principal_q5',
        prompt: "What would you need to see before trying this with even one class?",
        audio: "What would you need to see before trying this with even one class?",
        placeholder: "Type a few words, or skip",
        optional: true,
      }
    ]
  },
  Parent: {
    role: 'Parent',
    intro: "Thanks for trying the demo! We want to make studying easier for children and parents. A few short questions about how things work at your home today.",
    intro_audio: "Thanks for trying the demo! We want to make studying easier for children and parents. A few short questions about how things work at your home today.",
    questions: [
      {
        type: 'mcq',
        id: 'parent_q1',
        prompt: "Think about the last time you wondered if your child really understood a lesson. How did you find out?",
        audio: "Think about the last time you wondered if your child really understood a lesson. How did you find out?",
        options: ["I asked them to explain it", "I checked their notebook or homework", "I asked the teacher or tutor", "I waited for exam results", "I didn't find out"],
      },
      {
        type: 'mcq',
        id: 'parent_q2',
        prompt: "Roughly how much do you spend each month, in rupees, on tuition, learning apps or study material for your child?",
        audio: "Roughly how much do you spend each month, in rupees, on tuition, learning apps or study material for your child?",
        options: ["Nothing", "Under ₹1,000", "₹1,000 to ₹3,000", "₹3,000 to ₹6,000", "More than ₹6,000"],
      },
      {
        type: 'mcq',
        id: 'parent_q3',
        prompt: "Outside exams and parent-teacher meetings, how often do you hear how your child is doing?",
        audio: "Outside exams and parent-teacher meetings, how often do you hear how your child is doing?",
        options: ["Almost never", "Once a month", "Every week", "Every day"],
      },
      {
        type: 'mcq',
        id: 'parent_q4',
        prompt: "When you chose your child's current school, how much did its use of technology for learning matter?",
        audio: "When you chose your child's current school, how much did its use of technology for learning matter?",
        options: ["It was a deciding factor", "It was nice to have", "I didn't think about it", "I'd rather have less screen time"],
      },
      {
        type: 'text',
        id: 'parent_q5',
        prompt: "What frustrates you most about how your child studies at the moment?",
        audio: "What frustrates you most about how your child studies at the moment?",
        placeholder: "Type a few words, or skip",
        optional: true,
      }
    ]
  },
  Student: {
    role: 'Student',
    intro: "Awesome job finishing the demo! A few quick taps. Be honest, there are no wrong answers.",
    intro_audio: "Awesome job finishing the demo! A few quick taps. Be honest, there are no wrong answers.",
    questions: [
      {
        type: 'mcq',
        id: 'student_q1',
        prompt: "Think about your last big test. When did you really start studying?",
        audio: "Think about your last big test. When did you really start studying?",
        options: ["A week or more before", "2 or 3 days before", "The day before", "The night before", "I barely studied"],
      },
      {
        type: 'mcq',
        id: 'student_q2',
        prompt: "It's 9 PM and you're stuck on a hard problem. What's your first move?",
        audio: "It's 9 PM and you're stuck on a hard problem. What's your first move?",
        options: ["Skip it", "Ask a parent or sibling", "Google or an AI app", "Message a friend", "Wait and ask my teacher"],
      },
      {
        type: 'mcq',
        id: 'student_q3',
        prompt: "If you had to learn a new science chapter tomorrow, how would you rather do it?",
        audio: "If you had to learn a new science chapter tomorrow, how would you rather do it?",
        options: ["Read the textbook", "Watch a YouTube video", "Try something interactive, like the Light Lab", "Have someone explain it to me"],
      },
      {
        type: 'mcq',
        id: 'student_q4',
        prompt: "What would actually make you open a study app on a Saturday?",
        audio: "What would actually make you open a study app on a Saturday?",
        options: ["Beating friends on a leaderboard", "Keeping my daily streak", "Unlocking rewards and themes", "My parents asking me to", "Nothing would"],
      },
      {
        type: 'mcq',
        id: 'student_q5',
        prompt: "If you could skip one part of the demo, which would it be?",
        audio: "If you could skip one part of the demo, which would it be?",
        options: ["The pencil story at the start", "The Light Lab, moving things around", "Naming the parts of the lens", "The flashcard question", "None, I'd keep it all"],
      }
    ]
  },
  Other: {
    role: 'Other',
    intro: "Thanks for stopping by! We're curious who's visiting. A few quick questions.",
    intro_audio: "Thanks for stopping by! We're curious who's visiting. A few quick questions.",
    questions: [
      {
        type: 'mcq',
        id: 'other_q1',
        prompt: "What best describes you?",
        audio: "What best describes you?",
        options: ["Investor or advisor", "Friend or relative of the team", "Education consultant or EdTech professional", "Just curious", "Something else"],
      },
      {
        type: 'mcq',
        id: 'other_q2',
        prompt: "Which part of the demo stood out most to you?",
        audio: "Which part of the demo stood out most to you?",
        options: ["The story at the start", "The Light Lab, moving things around", "The voice guide", "Naming the parts of the lens", "The flashcard question", "Nothing really stood out"],
      },
      {
        type: 'mcq',
        id: 'other_q3',
        prompt: "Is there a school, teacher or parent you know who should see this?",
        audio: "Is there a school, teacher or parent you know who should see this?",
        options: ["Yes, and I'm happy to introduce you", "Maybe, ask me again later", "Not that I can think of"],
      },
      {
        type: 'text',
        id: 'other_q4',
        prompt: "What is one thing we should change or explain better?",
        audio: "What is one thing we should change or explain better?",
        placeholder: "Type a few words, or skip",
        optional: true,
      }
    ]
  }
};
