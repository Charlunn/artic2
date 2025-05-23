"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from "@/components/ui/date-picker-demo"; // Assuming a demo component
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LearningPlanPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('learningPlan')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('setupYourPlan', 'Set Up Your Learning Plan')}</CardTitle>
          <CardDescription>{t('customizeStudySchedule', 'Customize your study schedule and goals.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-lg">
          <div>
            <Label htmlFor="examTarget">{t('examTarget', 'Preferred Exam Target')}</Label>
            <Input id="examTarget" placeholder={t('examTargetPlaceholder', "e.g., IELTS 7.5, TOEFL 100")} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('startDate', 'Learning Plan Start Date')}</Label>
              <DatePickerDemo />
            </div>
            <div>
              <Label>{t('endDate', 'Learning Plan End Date (Optional)')}</Label>
              <DatePickerDemo />
            </div>
          </div>

          <div>
            <Label>{t('studyDays', 'Study Days of the Week')}</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox id={`day-${day.toLowerCase()}`} />
                  <Label htmlFor={`day-${day.toLowerCase()}`}>{t(day.toLowerCase() as any, day)}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button>{t('savePlan', 'Save Plan')}</Button>
          <p className="text-sm text-muted-foreground">{t('featureInProgress')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('examCountdown', 'Exam Countdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">-- {t('days', 'Days')} : -- {t('hours', 'Hours')} : -- {t('minutes', 'Minutes')}</p>
          <p className="text-sm text-muted-foreground">{t('featureInProgress')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Create a dummy DatePicker for the demo
function DatePickerDemo() {
    return <Input type="date" />;
}

