import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilitySchedulerProps {
  availability: AvailabilitySlot[];
  onChange: (availability: AvailabilitySlot[]) => void;
}

export default function AvailabilityScheduler({ availability, onChange }: AvailabilitySchedulerProps) {
  const [newSlot, setNewSlot] = useState<Partial<AvailabilitySlot>>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00"
  });

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const getDaySlots = (dayOfWeek: number) => {
    return availability.filter(slot => slot.dayOfWeek === dayOfWeek);
  };

  const formatTimeRange = (slots: AvailabilitySlot[]) => {
    if (slots.length === 0) return "Not Available";
    if (slots.length === 1) {
      return `${slots[0].startTime} - ${slots[0].endTime}`;
    }
    return `${slots.length} time slots`;
  };

  const isDayAvailable = (dayOfWeek: number) => {
    return getDaySlots(dayOfWeek).length > 0;
  };

  const toggleDayAvailability = (dayOfWeek: number, checked: boolean) => {
    if (checked) {
      // Add default time slot for this day
      const newSlot = {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00"
      };
      onChange([...availability, newSlot]);
    } else {
      // Remove all slots for this day
      onChange(availability.filter(slot => slot.dayOfWeek !== dayOfWeek));
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot = {
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00"
    };
    onChange([...availability, newSlot]);
  };

  const removeTimeSlot = (index: number) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    onChange(newAvailability);
  };

  const updateTimeSlot = (index: number, field: string, value: string) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    onChange(newAvailability);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dayNames.map((dayName, dayIndex) => {
          const daySlots = getDaySlots(dayIndex);
          const isAvailable = isDayAvailable(dayIndex);
          
          return (
            <div 
              key={dayIndex} 
              className={`p-4 border rounded-lg transition-colors ${
                isAvailable ? 'bg-green-50 border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${dayIndex}`}
                    checked={isAvailable}
                    onCheckedChange={(checked) => 
                      toggleDayAvailability(dayIndex, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`day-${dayIndex}`}
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {dayName}
                  </label>
                </div>
                {isAvailable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTimeSlot(dayIndex)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Slot
                  </Button>
                )}
              </div>
              
              {!isAvailable ? (
                <div className="text-sm text-gray-500">Not Available</div>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot, slotIndex) => {
                    const globalIndex = availability.findIndex(
                      s => s.dayOfWeek === slot.dayOfWeek && 
                           s.startTime === slot.startTime && 
                           s.endTime === slot.endTime
                    );
                    
                    return (
                      <div key={slotIndex} className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(globalIndex, 'startTime', e.target.value)}
                          className="flex-1 text-xs"
                        />
                        <span className="text-xs text-gray-500">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(globalIndex, 'endTime', e.target.value)}
                          className="flex-1 text-xs"
                        />
                        {daySlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(globalIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {availability.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">Select the days and times when you're available for skill exchanges.</p>
          <p className="text-sm">Check the boxes above to get started.</p>
        </div>
      )}
    </div>
  );
}
