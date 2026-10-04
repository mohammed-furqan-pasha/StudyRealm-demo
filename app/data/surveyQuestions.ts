import { SurveySet } from '../types';

export const surveyQuestions: Record<string, SurveySet> = {
  Teacher: {
    role: 'Teacher',
    intro: "Thanks for checking out the demo! As a teacher, your feedback shapes what we build. Could you answer 4 quick questions?",
    intro_audio: "Thanks for checking out the demo! As a teacher, your feedback shapes what we build. Could you answer four quick questions?",
    questions: [
      {
        type: 'mcq',
        id: 't_q1',
        prompt: 'How do you currently check if every student understood a concept?',
        audio: 'How do you currently check if every student understood a concept?',
        options: ['Ask a few students in class', 'Weekly or monthly written tests', 'Homework assignments', 'I rarely have time to check everyone'],
      },
      {
        type: 'mcq',
        id: 't_q2',
        prompt: 'How many hours per week do you spend manually checking or grading work?',
        audio: 'How many hours per week do you spend manually checking or grading work?',
        options: ['0-2 hours', '3-5 hours', '6-10 hours', 'More than 10 hours'],
      },
      {
        type: 'mcq',
        id: 't_q3',
        prompt: 'Would an automatic NCF 2023 compliance report save you time?',
        audio: 'Would an automatic NCF 2023 compliance report save you time?',
        options: ['Yes, definitely', 'Maybe', 'No', 'Not sure what that is'],
      },
      {
        type: 'text',
        id: 't_q4',
        prompt: 'What is the one thing you wish an app like this could do for you?',
        audio: 'What is the one thing you wish an app like this could do for you?',
        placeholder: 'Your thoughts...',
      }
    ]
  },
  Principal: {
    role: 'Principal',
    intro: "Thanks for exploring the demo! We'd love a leader's perspective. Could you share your thoughts?",
    intro_audio: "Thanks for exploring the demo! We'd love a leader's perspective. Could you share your thoughts?",
    questions: [
      {
        type: 'mcq',
        id: 'pr_q1',
        prompt: 'How do you track learning outcomes school-wide right now?',
        audio: 'How do you track learning outcomes school-wide right now?',
        options: ['Term exams and report cards', 'Teacher feedback meetings', 'Digital dashboard/ERP', 'Mostly informal updates'],
      },
      {
        type: 'mcq',
        id: 'pr_q2',
        prompt: 'How important is NCF 2023 compliance reporting for your school right now?',
        audio: 'How important is NCF 2023 compliance reporting for your school right now?',
        options: ['Top priority', 'Important but not urgent', 'Not a priority yet', 'Need more info on NCF'],
      },
      {
        type: 'mcq',
        id: 'pr_q3',
        prompt: 'What is your biggest hesitation when adopting new EdTech?',
        audio: 'What is your biggest hesitation when adopting new EdTech?',
        options: ['Teacher resistance or training time', 'Cost and budget', 'It might distract students', 'Poor integration with our current systems'],
      },
      {
        type: 'text',
        id: 'pr_q4',
        prompt: 'What would make you say yes to a 30-minute demo for your school?',
        audio: 'What would make you say yes to a 30-minute demo for your school?',
        placeholder: 'I would say yes if...',
      }
    ]
  },
  Parent: {
    role: 'Parent',
    intro: "Thanks for trying the demo! We want to make studying better for your child. Can you answer 4 short questions?",
    intro_audio: "Thanks for trying the demo! We want to make studying better for your child. Can you answer four short questions?",
    questions: [
      {
        type: 'mcq',
        id: 'pa_q1',
        prompt: 'How do you currently know if your child actually understood what they studied?',
        audio: 'How do you currently know if your child actually understood what they studied?',
        options: ['Wait for school exam results', 'I ask them questions myself', 'Tutor gives me updates', 'I rarely know until it is too late'],
      },
      {
        type: 'mcq',
        id: 'pa_q2',
        prompt: 'How many hours per week does your child spend on extra tuition or learning apps?',
        audio: 'How many hours per week does your child spend on extra tuition or learning apps?',
        options: ['None', '1-3 hours', '4-7 hours', '8+ hours'],
      },
      {
        type: 'mcq',
        id: 'pa_q3',
        prompt: 'Would a daily, plain-language progress update on your phone help you?',
        audio: 'Would a daily, plain-language progress update on your phone help you?',
        options: ['Yes, very much', 'It might be nice', 'No, I prefer fewer updates', 'Not sure'],
      },
      {
        type: 'text',
        id: 'pa_q4',
        prompt: 'What frustrates you most about how your child currently studies?',
        audio: 'What frustrates you most about how your child currently studies?',
        placeholder: 'The most frustrating thing is...',
      }
    ]
  },
  Student: {
    role: 'Student',
    intro: "Awesome job finishing the demo! Help us make learning even better by answering 3 quick questions.",
    intro_audio: "Awesome job finishing the demo! Help us make learning even better by answering 3 quick questions.",
    questions: [
      {
        type: 'mcq',
        id: 'st_q1',
        prompt: 'Did you enjoy learning this way?',
        audio: 'Did you enjoy learning this way?',
        options: ['🤩 Loved it!', '🙂 It was good', '😐 Meh', '😴 Boring'],
      },
      {
        type: 'mcq',
        id: 'st_q2',
        prompt: 'Was anything confusing?',
        audio: 'Was anything confusing?',
        options: ['No, everything was clear', 'A few parts were tricky', 'Yes, I was very confused'],
      },
      {
        type: 'mcq',
        id: 'st_q3',
        prompt: 'Do you want more chapters like this?',
        audio: 'Do you want more chapters like this?',
        options: ['Yes, definitely!', 'Maybe', 'No thanks'],
      }
    ]
  },
  Other: {
    role: 'Other',
    intro: "Thanks for stopping by! We're curious to know who's visiting. Could you tell us a bit about yourself?",
    intro_audio: "Thanks for stopping by! We are curious to know who is visiting. Could you tell us a bit about yourself?",
    questions: [
      {
        type: 'mcq',
        id: 'o_q1',
        prompt: 'What best describes you?',
        audio: 'What best describes you?',
        options: ['Investor', 'Friend or relative of the team', 'Education consultant', 'Just curious', 'Other'],
      },
      {
        type: 'mcq',
        id: 'o_q2',
        prompt: 'How likely are you to recommend this to a school you know?',
        audio: 'How likely are you to recommend this to a school you know?',
        options: ['Very likely', 'Somewhat likely', 'Not likely', 'Not applicable'],
      },
      {
        type: 'text',
        id: 'o_q3',
        prompt: 'Any thoughts or feedback for us?',
        audio: 'Any thoughts or feedback for us?',
        placeholder: 'Your feedback...',
      }
    ]
  }
};
