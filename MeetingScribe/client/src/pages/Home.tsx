import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMeetingStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Users, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const { meetings } = useMeetingStore();
  const [search, setSearch] = useState('');
  const [, setLocation] = useLocation();

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.date.includes(search)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
              M
            </div>
            <h1 className="text-xl font-bold tracking-tight font-serif">MinutesPro</h1>
          </div>
          <Button onClick={() => setLocation('/meeting/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Search & Filter */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search meetings by title or date..." 
              className="pl-10 h-12 text-lg shadow-sm bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Meetings List */}
        <div className="grid gap-4 max-w-4xl mx-auto">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No meetings found. Create one to get started.</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <Link key={meeting.id} href={`/meeting/${meeting.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl font-semibold group-hover:text-primary transition-colors">
                          {meeting.title}
                        </h3>
                        <Badge variant={meeting.status === 'finalized' ? 'secondary' : 'outline'}>
                          {meeting.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(meeting.date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(meeting.date), 'h:mm a')}
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.attendees.length} Attendees
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                      <span className="text-sm font-medium mr-2 sm:hidden">View Details</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
