import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-border/70 bg-background/70 backdrop-blur hover:bg-accent/15"
          onClick={toggleTheme}
          disabled={!toggleTheme}
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isLight ? 'Dark mode' : 'Light mode'}
      </TooltipContent>
    </Tooltip>
  );
}
