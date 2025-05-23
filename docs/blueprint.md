# **App Name**: LingoLeap

## Core Features:

- Bilingual UI: A bilingual user interface to cater to Chinese users with plans for internationalization, where users can switch the application language between Chinese and English.
- Learning Plan Management: A personalized learning plan based on the user's preferred exam target and study habits, with features for setting study/rest days and tracking progress. Display a countdown timer for their exam target.
- AI-Powered Content Processing: Integrate Gemini API via a secure backend API endpoint to process article text, translate it, and generate a structured output of key vocabulary, phrases, and reading comprehension questions.  The backend API acts as a tool to securely manage and use the Gemini API.
- Interactive Learning Page: An interactive learning page for users to study articles, including a task list that makes use of a timer that sends periodic updates to the database via an API to log progress, and a sidebar displaying key vocabulary and phrases from the article.
- Intelligent Review System: A review system that creates a user review history in its own dedicated database, allowing for users to check on learning records and manage review dates in a fun user-friendly experience
- User Authentication: Authentication using NextAuth to handle user sign-ups and log-ins.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to represent wisdom and sophistication, aligning with the learning app's purpose. The hue is a nod towards traditional scholarly colors.
- Background color: Very light purple (#F3E5F5), a desaturated tone of the primary color to provide a comfortable, distraction-free reading experience.
- Accent color: A soft blue (#3F51B5) to complement the purple, adding a touch of calmness and trust, useful for progress indicators and interactive elements.
- Clear and legible typography for both Chinese and English, optimized for readability on screen.
- Clean, modern icons to represent different article categories and learning tools.
- A clean and intuitive layout that is user-friendly for both Chinese and international users.