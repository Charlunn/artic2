"use client";

import { useParams } from "next/navigation";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckSquare, Clock, Headphones, Mic, PencilLine, BookText, Sparkles, ClipboardCopy } from "lucide-react";
import Image from "next/image";

// Mock data for a single article, replace with actual data fetching based on articleId
const mockArticle = {
  id: "1",
  title: "The Impact of Technology on Modern Communication",
  originalText: "Technology has revolutionized the way we communicate. From instant messaging apps to video conferencing tools, the digital age has brought people closer than ever before. However, this constant connectivity also presents challenges, such as information overload and the erosion of face-to-face interaction skills.\n\nOne of the most significant changes is the speed of communication. Messages can be sent and received in seconds, regardless of geographical distance. This has profound implications for businesses, personal relationships, and global events. Social media platforms have also emerged as powerful tools for disseminating information and mobilizing communities, though they are not without their controversies regarding privacy and misinformation.",
  translationText: "技术彻底改变了我们的沟通方式。从即时通讯应用到视频会议工具，数字时代使人们比以往任何时候都更加紧密。然而，这种持续的连接也带来了挑战，例如信息过载和面对面互动技能的削弱。\n\n最重要的变化之一是沟通的速度。无论地理距离如何，消息都可以在几秒钟内发送和接收。这对商业、个人关系和全球事件都产生了深远的影响。社交媒体平台也已成为传播信息和动员社区的强大工具，尽管它们在隐私和错误信息方面并非没有争议。",
  newWords: [
    { word: "revolutionized", translation: "彻底改变了" },
    { word: "erosion", translation: "削弱，侵蚀" },
    { word: "profound", translation: "深远的" },
    { word: "disseminating", translation: "传播" },
  ],
  phrases: [
    { phrase: "face-to-face interaction", translation: "面对面互动", example: "We need more face-to-face interaction." },
    { phrase: "information overload", translation: "信息过载", example: "Many people suffer from information overload." },
  ],
  image: "https://placehold.co/1200x300.png",
  dataAiHint: "technology communication",
};


export default function LearnArticlePage() {
  const params = useParams();
  const articleId = params.articleId as string;
  const { t } = useI18n();

  // In a real app, fetch article data based on articleId
  const article = mockArticle; // Using mock data for now

  if (!article) {
    return <div>{t('loadingArticle', 'Loading article...')}</div>;
  }

  const learningTasks = [
    { id: 'skimming', name: t('skimming'), icon: Clock, time: '5 min' },
    { id: 'intensiveReading', name: t('intensiveReading'), icon: BookText, time: '20 min' },
    { id: 'vocabularyBuilding', name: t('vocabularyBuilding'), icon: Sparkles, time: '15 min' },
    { id: 'phraseLearning', name: t('phraseLearning'), icon: ClipboardCopy, time: '10 min' },
    // { id: 'translationPractice', name: t('translationPractice'), icon: Languages, time: '15 min' },
    // { id: 'recitation', name: t('recitation'), icon: Mic, time: '10 min' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem-var(--page-padding,32px))] max-h-[calc(100vh-4rem-var(--page-padding,32px))]">
      {/* Main Content Area */}
      <div className="flex-grow lg:w-2/3 flex flex-col overflow-hidden">
        <Card className="flex-grow flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">{article.title}</CardTitle>
            <div className="relative w-full h-48 md:h-64 mt-2 rounded-md overflow-hidden">
              <Image src={article.image} alt={article.title} layout="fill" objectFit="cover" data-ai-hint={article.dataAiHint}/>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <ScrollArea className="h-[calc(100vh-20rem)] md:h-auto md:max-h-[60vh] pr-3">
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-2">{t('originalText')}</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{article.originalText}</p>
              </ScrollArea>
              <ScrollArea className="h-[calc(100vh-20rem)] md:h-auto md:max-h-[60vh] pr-3">
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-2">{t('translatedText')}</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">{article.translationText}</p>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Area */}
      <div className="lg:w-1/3 flex flex-col gap-6 overflow-hidden">
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle>{t('learningTasks', 'Learning Tasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {learningTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <task.icon className="h-5 w-5 text-primary" />
                    <span>{task.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{task.time}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-4">{t('finishLearning')}</Button>
          </CardContent>
        </Card>

        <Card className="flex-grow overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>{t('vocabularyAndPhrases', 'Vocabulary & Phrases')}</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-grow px-2">
            <CardContent className="pt-0">
              <h4 className="font-semibold mb-2">{t('newWords')}</h4>
              <ul className="space-y-1 mb-4">
                {article.newWords.map(word => (
                  <li key={word.word} className="text-sm"><strong>{word.word}:</strong> {word.translation}</li>
                ))}
              </ul>
              <Separator className="my-3"/>
              <h4 className="font-semibold mb-2">{t('phrases')}</h4>
              <ul className="space-y-1">
                {article.phrases.map(phrase => (
                  <li key={phrase.phrase} className="text-sm">
                    <strong>{phrase.phrase}:</strong> {phrase.translation}
                    {phrase.example && <em className="block text-xs text-muted-foreground">"{phrase.example}"</em>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </ScrollArea>
        </Card>
        
        <Card className="flex-shrink-0">
            <CardHeader><CardTitle>{t('tools', 'Tools')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline"><Headphones className="mr-2 h-4 w-4"/>{t('textToSpeech', 'TTS')}</Button>
                <Button variant="outline"><Mic className="mr-2 h-4 w-4"/>{t('recordAudio', 'Record')}</Button>
                <Button variant="outline"><PencilLine className="mr-2 h-4 w-4"/>{t('notes', 'Notes')}</Button>
                <Button variant="outline"><Sparkles className="mr-2 h-4 w-4"/>{t('quickLookup', 'Dictionary')}</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add a dynamic style for page padding calculation
export const dynamic = 'force-dynamic'; // Or 'auto' if it does not cause issues
export const revalidate = 0;
