import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface Skill {
  name: string;
  level: string;
}

interface SkillInputProps {
  onSkillAdd: (skill: Skill) => void;
  onSkillRemove: (index: number) => void;
  placeholder?: string;
  hideLevel?: boolean;
  existingSkills?: Skill[];
}

export default function SkillInput({ 
  onSkillAdd, 
  onSkillRemove, 
  placeholder = "Add a skill...",
  hideLevel = false,
  existingSkills = []
}: SkillInputProps) {
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");

  const handleAddSkill = () => {
    if (!skillName.trim()) return;

    const newSkill = {
      name: skillName.trim(),
      level: hideLevel ? "any" : skillLevel
    };

    onSkillAdd(newSkill);
    setSkillName("");
    setSkillLevel("beginner");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-3">
      {/* Display existing skills */}
      {existingSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingSkills.map((skill, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="flex items-center gap-1 pr-1"
            >
              {skill.name} 
              {!hideLevel && skill.level !== "any" && (
                <span className="text-xs opacity-70">({skill.level})</span>
              )}
              <button
                onClick={() => onSkillRemove(index)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add new skill form */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        
        {!hideLevel && (
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Button 
          type="button"
          onClick={handleAddSkill}
          disabled={!skillName.trim()}
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
