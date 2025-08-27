import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  title: string;
  value?: string;
  description?: React.ReactNode;
  icon?: LucideIcon | string;
  iconClassName?: string;
  children?: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode; // New prop for actions in header
}

export function PlaceholderCard({ title, value, description, icon, iconClassName, children, className, headerActions }: PlaceholderCardProps) {
  const isStringPathIcon = typeof icon === 'string';
  const IconComponent = typeof icon === 'function' ? icon : null;

  return (
    <Card className={cn(
      "bg-card text-card-foreground rounded-lg shadow-card-custom border border-transparent transition-shadow duration-200 hover:shadow-card-custom-hover focus-within:shadow-card-custom-hover",
      "flex flex-col",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-start justify-between p-4 pb-2"
      )}>
        <div className="flex-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
             {!isStringPathIcon && IconComponent && (
               <IconComponent className={cn("h-5 w-5 shrink-0", iconClassName || "text-muted-foreground")} />
            )}
            {title}
          </CardTitle>
          {description && !value && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {value && (
            <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
        )}
        {headerActions && <div>{headerActions}</div>}
      </CardHeader>
      <CardContent className={cn(
        "p-4 pt-0",
        "flex flex-col flex-grow"
      )}>
        {children && <div className="flex-grow mt-2">{children}</div>}
      </CardContent>
    </Card>
  );
}
