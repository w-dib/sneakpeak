"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  FileSpreadsheet,
  ImageIcon,
  Lock,
  Mail,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";

const initialSchedule = {
  mon: { enabled: true, range: [0, 24] },
  tue: { enabled: true, range: [0, 24] },
  wed: { enabled: true, range: [0, 24] },
  thu: { enabled: true, range: [0, 24] },
  fri: { enabled: true, range: [0, 24] },
  sat: { enabled: true, range: [0, 24] },
  sun: { enabled: true, range: [0, 24] },
};

type Schedule = typeof initialSchedule;
type Day = keyof Schedule;

const formatHour = (hour: number) => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour === 24) return "12 AM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

const CHECKS_PER_HOUR: { [key: string]: number } = {
  every_minute: 60,
  hourly: 1,
  every_12_hours: 1 / 12,
  daily: 1 / 24,
  weekly: 1 / (24 * 7),
};

export function NewJobDialog({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const [url, setUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [schedule, setSchedule] = useState<Schedule>(initialSchedule);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl.trim() === "") {
      setIsUrlValid(true);
      return;
    }

    try {
      let urlToTest = newUrl;
      if (!/^https?:\/\//i.test(urlToTest)) {
        urlToTest = `https://${urlToTest}`;
      }
      new URL(urlToTest);
      setIsUrlValid(true);
    } catch {
      setIsUrlValid(false);
    }
  };

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const handlePreset = (preset: "weekdays" | "weekends" | "all" | "none") => {
    let newSchedule = { ...schedule };
    const weekdays: Day[] = ["mon", "tue", "wed", "thu", "fri"];
    const weekends: Day[] = ["sat", "sun"];

    switch (preset) {
      case "weekdays":
        weekdays.forEach((day) => {
          newSchedule[day] = { enabled: true, range: [9, 17] };
        });
        weekends.forEach((day) => {
          newSchedule[day] = { enabled: false, range: [9, 17] };
        });
        break;
      case "weekends":
        weekdays.forEach((day) => {
          newSchedule[day] = { enabled: false, range: [9, 17] };
        });
        weekends.forEach((day) => {
          newSchedule[day] = { enabled: true, range: [9, 17] };
        });
        break;
      case "all":
        newSchedule = initialSchedule;
        break;
      case "none":
        Object.keys(newSchedule).forEach((day) => {
          newSchedule[day as Day] = {
            ...newSchedule[day as Day],
            enabled: false,
          };
        });
        break;
    }
    setSchedule(newSchedule);
  };

  const { totalHours, totalChecks } = useMemo(() => {
    let totalHours = 0;
    Object.values(schedule).forEach((day) => {
      if (day.enabled) {
        totalHours += day.range[1] - day.range[0];
      }
    });
    const checksPerHour = CHECKS_PER_HOUR[frequency] || 0;
    const totalChecks = totalHours * checksPerHour;
    return { totalHours, totalChecks };
  }, [schedule, frequency]);

  const isGoDisabled = url.trim() === "";
  const isCreateJobDisabled =
    url.trim() === "" || jobTitle.trim() === "" || !isUrlValid;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Create a New Job
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="snapshot">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="snapshot">
            <div className="space-y-2 py-4">
              <Label htmlFor="url">Website URL*</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="url"
                  placeholder="Enter a website: e.g. https://google.com"
                  value={url}
                  onChange={handleUrlChange}
                  className={!isUrlValid ? "border-destructive" : ""}
                />
                <Button type="submit" disabled={isGoDisabled}>
                  Go
                </Button>
              </div>
              {!isUrlValid && (
                <p className="text-sm text-destructive">
                  Please enter a valid URL.
                </p>
              )}
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-[200px] w-full">
              <div className="flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  A snapshot of your website will appear here
                </p>
              </div>
            </div>
            <Accordion
              type="single"
              collapsible
              className="w-full mt-4"
              defaultValue="item-1"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Required Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Job Title*
                      </Label>
                      <Input
                        id="name"
                        placeholder="What are we looking for?"
                        className="col-span-3"
                        value={jobTitle}
                        onChange={handleJobTitleChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="frequency" className="text-right">
                        Check Frequency
                      </Label>
                      <Select
                        defaultValue="daily"
                        value={frequency}
                        onValueChange={setFrequency}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="every_minute" disabled>
                            Every minute
                          </SelectItem>
                          <SelectItem value="hourly" disabled>
                            Every hour
                          </SelectItem>
                          <SelectItem value="every_12_hours">
                            Every 12 hours
                          </SelectItem>
                          <SelectItem value="daily">Every day</SelectItem>
                          <SelectItem value="weekly">Every week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>AI Assistance</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    <Label htmlFor="ai-prompt">
                      Get alerts for specific changes
                    </Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="e.g., Alert me when the price of the new iPhone changes."
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Select where you&apos;d like to receive alerts for this job.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 border-primary bg-muted"
                >
                  <Mail className="h-6 w-6" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="relative h-24 flex-col gap-2"
                  disabled
                >
                  <MessageSquare className="h-6 w-6" />
                  Slack
                  <Lock className="h-4 w-4 absolute top-2 right-2" />
                </Button>
                <Button
                  variant="outline"
                  className="relative h-24 flex-col gap-2"
                  disabled
                >
                  <FileSpreadsheet className="h-6 w-6" />
                  Google Sheets
                  <Lock className="h-4 w-4 absolute top-2 right-2" />
                </Button>
                <Button
                  variant="outline"
                  className="relative h-24 flex-col gap-2"
                  disabled
                >
                  <Users className="h-6 w-6" />
                  Teams
                  <Lock className="h-4 w-4 absolute top-2 right-2" />
                </Button>
              </div>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>Advanced Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <Label htmlFor="email" className="font-semibold">
                        Email
                      </Label>
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        defaultValue={email}
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Additional recipients (CC):{" "}
                        <Button variant="link" className="p-0 h-auto text-sm">
                          + Add more in account settings
                        </Button>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="relative">
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <p className="text-2xl font-bold">SOON</p>
              </div>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Advanced Job Scheduling
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Run this job in a specific time frame only.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePreset("weekdays")}
                  >
                    Weekdays (9-5)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePreset("weekends")}
                  >
                    Weekends
                  </Button>
                  <Button variant="outline" onClick={() => handlePreset("all")}>
                    24/7
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handlePreset("none")}
                  >
                    Reset Selection
                  </Button>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-center text-muted-foreground">
                    This page will be checked{" "}
                    <span className="font-bold text-foreground">
                      {Math.round(totalChecks)} times
                    </span>{" "}
                    a week across{" "}
                    <span className="font-bold text-foreground">
                      {totalHours} hours
                    </span>
                    .
                  </p>
                </div>
                <div className="space-y-4">
                  {Object.entries(schedule).map(([day, value]) => (
                    <div
                      key={day}
                      className="grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <Checkbox
                          id={day}
                          checked={value.enabled}
                          onCheckedChange={(checked) => {
                            setSchedule((prev) => ({
                              ...prev,
                              [day]: {
                                ...prev[day as Day],
                                enabled: !!checked,
                              },
                            }));
                          }}
                        />
                        <Label htmlFor={day} className="capitalize font-medium">
                          {day}
                        </Label>
                      </div>
                      <Slider
                        className="col-span-7"
                        value={value.range}
                        onValueChange={(newRange) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day]: { ...prev[day as Day], range: newRange },
                          }))
                        }
                        min={0}
                        max={24}
                        step={1}
                        disabled={!value.enabled}
                      />
                      <div className="col-span-3 text-sm text-muted-foreground text-right">
                        {formatHour(value.range[0])} -{" "}
                        {formatHour(value.range[1])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isCreateJobDisabled}>
            Create Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
