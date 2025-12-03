import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  duration: string; // e.g. "10 mins"
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string[]; // Comma separated strings in UI, but array here? Let's keep it simple strings for now as per prompt req
  attendeesString: string; // Helper for the UI input
  agendaItems: AgendaItem[];
  discussionNotes: string;
  actionItems: ActionItem[];
  decisions: string;
  status: 'draft' | 'finalized';
}

interface MeetingStore {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  getMeeting: (id: string) => Meeting | undefined;
}

// Initial Mock Data
const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q4 Product Strategy Review',
    date: '2025-10-15T10:00',
    attendees: ['Alice Chen', 'Bob Smith', 'Charlie Davis'],
    attendeesString: 'Alice Chen, Bob Smith, Charlie Davis',
    agendaItems: [
      { id: 'a1', title: 'Review Q3 Metrics', duration: '15m' },
      { id: 'a2', title: 'Q4 Roadmap Brainstorm', duration: '30m' },
      { id: 'a3', title: 'Resource Allocation', duration: '15m' }
    ],
    discussionNotes: 'Alice presented the Q3 metrics. Growth is steady at 15% MoM. Churn has decreased slightly.\n\nBob raised concerns about the engineering bandwidth for the new AI features. We agreed to prioritize the core infrastructure first.',
    actionItems: [
      { id: 'ac1', task: 'Finalize Q4 roadmap document', owner: 'Alice Chen', dueDate: '2025-10-20', completed: false },
      { id: 'ac2', task: 'Hire 2 senior backend engineers', owner: 'Charlie Davis', dueDate: '2025-11-01', completed: false }
    ],
    decisions: '1. Prioritize "Project Falcon" over "Project Eagle".\n2. Approve budget for 2 new hires.',
    status: 'finalized'
  },
  {
    id: '2',
    title: 'Weekly Design Sync',
    date: '2025-12-03T14:00',
    attendees: ['Sarah Lee', 'Mike Brown'],
    attendeesString: 'Sarah Lee, Mike Brown',
    agendaItems: [
      { id: 'a1', title: 'Critique: New Dashboard', duration: '20m' },
      { id: 'a2', title: 'Design System Updates', duration: '10m' }
    ],
    discussionNotes: 'Reviewed the new dashboard layouts. The "Dark Mode" contrast needs adjustment.',
    actionItems: [
      { id: 'ac1', task: 'Update color tokens in Figma', owner: 'Sarah Lee', dueDate: '2025-12-05', completed: true }
    ],
    decisions: 'Adopt the new "Inter" font pairing for all headers.',
    status: 'draft'
  }
];

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meetings: initialMeetings,
      addMeeting: (meeting) => set((state) => ({ 
        meetings: [{ ...meeting, id: nanoid() }, ...state.meetings] 
      })),
      updateMeeting: (id, updatedFields) => set((state) => ({
        meetings: state.meetings.map((m) => 
          m.id === id ? { ...m, ...updatedFields } : m
        )
      })),
      deleteMeeting: (id) => set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id)
      })),
      getMeeting: (id) => get().meetings.find((m) => m.id === id),
    }),
    {
      name: 'minutes-pro-storage',
    }
  )
);
