import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMeetingStore, Meeting } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Trash2, Plus, Download, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function MeetingDetail() {
  const [, params] = useRoute('/meeting/:id');
  const [, setLocation] = useLocation();
  const { getMeeting, addMeeting, updateMeeting, deleteMeeting } = useMeetingStore();
  const { toast } = useToast();
  
  const isNew = params?.id === 'new';
  const meetingId = params?.id;

  const form = useForm<Meeting>({
    defaultValues: {
      title: '',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      attendeesString: '',
      discussionNotes: '',
      decisions: '',
      status: 'draft',
      agendaItems: [{ id: nanoid(), title: '', duration: '' }],
      actionItems: []
    }
  });

  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control: form.control,
    name: "agendaItems"
  });

  const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
    control: form.control,
    name: "actionItems"
  });

  useEffect(() => {
    if (!isNew && meetingId) {
      const meeting = getMeeting(meetingId);
      if (meeting) {
        form.reset(meeting);
      } else {
        setLocation('/'); // Redirect if not found
      }
    }
  }, [isNew, meetingId, getMeeting, form, setLocation]);

  const onSubmit = (data: Meeting) => {
    // Parse attendees string to array
    const attendees = data.attendeesString.split(',').map(s => s.trim()).filter(Boolean);
    const finalData = { ...data, attendees };

    if (isNew) {
      addMeeting(finalData);
      toast({ title: "Meeting Created", description: "Your meeting notes have been started." });
      setLocation('/');
    } else if (meetingId) {
      updateMeeting(meetingId, finalData);
      toast({ title: "Saved", description: "Meeting updated successfully." });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      if (meetingId) deleteMeeting(meetingId);
      setLocation('/');
    }
  };

  const handleExport = async () => {
    // 1. Create a dedicated print container if it doesn't exist
    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      // Hide it from screen but keep it in DOM for html2canvas
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '800px'; // Fixed A4-ish width
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.padding = '40px';
      document.body.appendChild(printContainer);
    }
    
    // 2. Populate with clean, inline-styled HTML
    const title = form.getValues('title') || 'Untitled Meeting';
    const date = form.getValues('date') ? format(new Date(form.getValues('date')), 'MMMM d, yyyy h:mm a') : 'N/A';
    const attendees = form.getValues('attendeesString') || 'None';
    const notes = form.getValues('discussionNotes') || 'No notes recorded.';
    const decisions = form.getValues('decisions') || 'No decisions recorded.';
    
    // Simple helper for clean styles
    const h1Style = "font-family: sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #111827;";
    const h2Style = "font-family: sans-serif; font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;";
    const pStyle = "font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 10px;";
    const metaLabelStyle = "font-weight: bold; color: #4b5563;";
    const itemStyle = "font-family: sans-serif; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151;";

    let agendaHtml = '';
    agendaFields.forEach((item, i) => {
      agendaHtml += `<div style="${itemStyle}">
        <span style="font-weight: bold; margin-right: 10px;">${i + 1}.</span>
        <span>${form.getValues(`agendaItems.${i}.title`) || 'Untitled'}</span>
        <span style="float: right; color: #6b7280;">${form.getValues(`agendaItems.${i}.duration`) || ''}</span>
      </div>`;
    });

    let actionsHtml = '';
    actionFields.forEach((item, i) => {
      const task = form.getValues(`actionItems.${i}.task`);
      const owner = form.getValues(`actionItems.${i}.owner`);
      const dueDate = form.getValues(`actionItems.${i}.dueDate`);
      const completed = form.getValues(`actionItems.${i}.completed`);
      
      actionsHtml += `<div style="${itemStyle} display: flex; justify-content: space-between;">
        <div>
          <span style="margin-right: 8px;">${completed ? '☑' : '☐'}</span>
          <span style="${completed ? 'text-decoration: line-through; color: #9ca3af;' : ''}">${task || 'Untitled Task'}</span>
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          ${owner ? `<span style="margin-right: 10px;">👤 ${owner}</span>` : ''}
          ${dueDate ? `<span>📅 ${dueDate}</span>` : ''}
        </div>
      </div>`;
    });

    printContainer.innerHTML = `
      <div style="font-family: sans-serif; color: #000000;">
        <h1 style="${h1Style}">${title}</h1>
        <div style="margin-bottom: 20px;">
          <p style="${pStyle}"><span style="${metaLabelStyle}">Date:</span> ${date}</p>
          <p style="${pStyle}"><span style="${metaLabelStyle}">Attendees:</span> ${attendees}</p>
        </div>
        
        ${agendaFields.length > 0 ? `
          <h2 style="${h2Style}">Agenda</h2>
          <div>${agendaHtml}</div>
        ` : ''}

        <h2 style="${h2Style}">Discussion Notes</h2>
        <p style="${pStyle} white-space: pre-wrap;">${notes}</p>

        ${decisions ? `
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #111827;">Decisions Made</h3>
            <p style="${pStyle} white-space: pre-wrap; margin-bottom: 0;">${decisions}</p>
          </div>
        ` : ''}

        ${actionFields.length > 0 ? `
          <h2 style="${h2Style}">Action Items</h2>
          <div>${actionsHtml}</div>
        ` : ''}
      </div>
    `;

    toast({ 
      title: "Generating PDF...", 
      description: "Please wait while we prepare your download." 
    });

    try {
      // Create canvas from the clean print container
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Force white background
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${form.getValues('title') || 'meeting-minutes'}.pdf`;
      pdf.save(filename);
      
      // Clean up
      document.body.removeChild(printContainer);
      
      toast({ title: "Success", description: "PDF downloaded successfully." });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({ title: "Error", description: `Failed to generate PDF: ${errorMessage}`, variant: "destructive" });
      
      // Clean up even on error
      if (printContainer && printContainer.parentNode) {
        document.body.removeChild(printContainer);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        
        {/* Header / Toolbar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/')} type="button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-lg font-bold truncate max-w-[200px] sm:max-w-md">
                  {isNew ? 'New Meeting' : form.watch('title') || 'Untitled Meeting'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isNew ? 'Draft' : (form.watch('status') === 'finalized' ? 'Finalized' : 'Last edited just now')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && (
                <Button variant="outline" size="sm" type="button" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
              <Button type="submit" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </header>

        <div id="meeting-content" className="container mx-auto px-4 py-8 max-w-4xl space-y-8 bg-background">
          
          {/* Basic Info Card */}
          <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="font-serif text-3xl">{form.watch('title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6 px-0">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  {...form.register('date')} 
                  className="border-none shadow-none px-0 h-auto text-base bg-transparent focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Attendees</label>
                <Input 
                  {...form.register('attendeesString')} 
                  placeholder="Alice, Bob, Charlie..." 
                  className="border-none shadow-none px-0 h-auto text-base bg-transparent focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>
          
          <Separator />

          {/* Agenda */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">Agenda</h2>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="data-[html2canvas-ignore]:hidden"
                data-html2canvas-ignore="true"
                onClick={() => appendAgenda({ id: nanoid(), title: '', duration: '' })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
            
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              {agendaFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-baseline group">
                  <span className="text-sm text-muted-foreground font-mono min-w-[1.5rem]">{index + 1}.</span>
                  <div className="flex-1 flex gap-2 items-baseline">
                    <Input 
                      {...form.register(`agendaItems.${index}.title` as const)} 
                      placeholder="Agenda item topic"
                      className="border-none shadow-none p-0 h-auto text-base font-medium bg-transparent focus-visible:ring-0"
                    />
                    <span className="text-muted-foreground text-sm whitespace-nowrap">
                      (<Input 
                        {...form.register(`agendaItems.${index}.duration` as const)} 
                        placeholder="15m"
                        className="border-none shadow-none p-0 h-auto w-10 text-sm inline bg-transparent focus-visible:ring-0 text-center"
                      />)
                    </span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeAgenda(index)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity data-[html2canvas-ignore]:hidden"
                    data-html2canvas-ignore="true"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {agendaFields.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No agenda items recorded.</p>
              )}
            </div>
          </section>

          <Separator />

          {/* Discussion & Decisions */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold">Discussion Notes</h2>
              <Textarea 
                {...form.register('discussionNotes')} 
                placeholder="Record the key points of the discussion here..." 
                className="min-h-[200px] leading-relaxed border-none shadow-none p-0 resize-none focus-visible:ring-0 text-base"
              />
            </div>
            
            <div className="bg-muted/30 p-6 rounded-lg border border-muted/50">
              <h3 className="font-serif text-lg font-bold text-primary mb-4">Decisions Made</h3>
              <Textarea 
                {...form.register('decisions')} 
                placeholder="List the final decisions agreed upon..." 
                className="min-h-[100px] bg-transparent border-none shadow-none p-0 resize-none focus-visible:ring-0 text-base"
              />
            </div>
          </section>

          {/* Action Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">Action Items</h2>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className="data-[html2canvas-ignore]:hidden"
                data-html2canvas-ignore="true"
                onClick={() => appendAction({ id: nanoid(), task: '', owner: '', dueDate: '', completed: false })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Action
              </Button>
            </div>

            <div className="space-y-3">
              {actionFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 group p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 h-6 w-6 shrink-0"
                    onClick={() => {
                      const current = form.getValues(`actionItems.${index}.completed`);
                      form.setValue(`actionItems.${index}.completed`, !current);
                    }}
                  >
                    {form.watch(`actionItems.${index}.completed`) ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <div className="flex-1 grid sm:grid-cols-[1fr_150px_150px] gap-4 items-baseline">
                    <Input 
                      {...form.register(`actionItems.${index}.task` as const)} 
                      placeholder="Task description"
                      className={`border-none shadow-none p-0 h-auto text-base bg-transparent focus-visible:ring-0 ${form.watch(`actionItems.${index}.completed`) ? 'line-through text-muted-foreground' : ''}`}
                    />
                    <Input 
                      {...form.register(`actionItems.${index}.owner` as const)} 
                      placeholder="Owner"
                      className="border-none shadow-none p-0 h-auto text-sm text-muted-foreground bg-transparent focus-visible:ring-0"
                    />
                     <Input 
                      type="date"
                      {...form.register(`actionItems.${index}.dueDate` as const)} 
                      className="border-none shadow-none p-0 h-auto text-sm text-muted-foreground bg-transparent focus-visible:ring-0 w-auto"
                    />
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeAction(index)}
                    className="text-muted-foreground hover:text-destructive h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity data-[html2canvas-ignore]:hidden"
                    data-html2canvas-ignore="true"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
               {actionFields.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No action items assigned.</p>
              )}
            </div>
          </section>

          {!isNew && (
            <div className="flex justify-end pt-12 data-[html2canvas-ignore]:hidden" data-html2canvas-ignore="true">
              <Button 
                type="button" 
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Meeting Record
              </Button>
            </div>
          )}

        </div>
      </form>
    </div>
  );
}
