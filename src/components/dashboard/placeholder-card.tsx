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
        "flex flex-row items-start justify-between p-4 pb-2" // Use justify-between for actions
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isStringPathIcon && "flex-col items-start" // if image icon, stack title below
        )}>
          {isStringPathIcon && icon && (
            <div className="mb-2"> {/* Adjusted margin for image icon case */}
              <Image src={icon} alt={title} width={32} height={32} className="object-contain" />
            </div>
          )}
          {!isStringPathIcon && IconComponent && (
             <IconComponent className={cn("h-5 w-5 shrink-0 mt-0.5", iconClassName || "text-muted-foreground")} />
          )}
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
        </div>
        {headerActions && <div>{headerActions}</div>}
      </CardHeader>
      <CardContent className={cn(
        "p-4 pt-0",
        "flex flex-col flex-grow"
      )}>
        {value && <div className="text-3xl font-bold text-foreground">{value}</div>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {children && <div className={cn("flex-grow", value || description ? "mt-4" : "")}>{children}</div>}
        {!children && !value && !description && (
          <div className="text-muted-foreground h-[50px] flex items-center flex-grow">Placeholder content</div>
        )}
      </CardContent>
    </Card>
  );
}
