"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

// const resp = {
//     message: "Analysis completed for all selected repositories.",
//     suggestedFixes: {
//         "java-calculator": {
//             "src/Main.java": {
//                 fixed_code: `import java.util.Scanner;

// public class Main {
//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);
//         while (true) {
//             System.out.print("Input(ex: 5 + 3): ");
//             String input = sc.nextLine();
//             if (input.equals("exit") || input.equals("quit")) {
//                 break;
//             }
//             String[] details = input.split("\\s+");
//             if (details.length != 3) {
//                 System.out.println("Invalid input format.");
//                 continue;
//             }
//             try {
//                 int firstNum = Integer.parseInt(details[0]);
//                 int secondNum = Integer.parseInt(details[2]);
//                 String operator = details[1];
//                 if (operator.equals("*")) {
//                     int result = firstNum * secondNum;
//                     System.out.println("Result: " + result);
//                 } else if (operator.equals("+")) {
//                     int result = firstNum + secondNum;
//                     System.out.println("Result: " + result);
//                 } else if (operator.equals("-")) {
//                     int result = firstNum - secondNum;
//                     System.out.println("Result: " + result);
//                 } else if (operator.equals("/")) {
//                     if (secondNum == 0) {
//                         System.out.println("Cannot divide by zero.");
//                     } else {
//                         int result = firstNum / secondNum;
//                         System.out.println("Result: " + result);
//                     }
//                 }
//                 else {
//                     System.out.println("Error");
//                 }
//             } catch (NumberFormatException e) {
//                 System.out.println("Invalid number format.");
//             }
//         }
//         sc.close();
//     }
// }`,
//                     original_code: `import java.util.Scanner;
//
// public class Main {
//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);
//         while (true) {
//             System.out.print("Input(ex: 5 + 3): ");
//             String input = sc.nextLine();
//             if (input.equals("exit") || input.equals("quit")) {
//                 break;
//             }
//             String[] details = input.split("\\s+");
//             int firstNum = Integer.parseInt(details[0]);
//             int secondNum = Integer.parseInt(details[2]);
//             String operator = details[1];
//             if (operator.equals("*")) {
//                 int result = firstNum * secondNum;
//                 System.out.println("Result: " + result);
//             } else if (operator.equals("+")) {
//                 int result = firstNum + secondNum;
//                 System.out.println("Result: " + result);
//             } else if (operator.equals("-")) {
//                 int result = firstNum - secondNum;
//                 System.out.println("Result: " + result);
//             } else if (operator.equals("/")) {
//                 int result = firstNum / secondNum;
//                 System.out.println("Result: " + result);
//             }
//             else {
//                 System.out.println("Error");
//             }
//         }
//         sc.close();
//     }
// }`,
//                     issues: [
//                         {
//                             issue: "ArrayIndexOutOfBoundsException",
//                             explanation:
//                                 "If the input string does not contain two operands and an operator, accessing details[0], details[1], or details[2] may throw an exception.",
//                             line_start: 13,
//                             line_end: 15,
//                         },
//                         {
//                             issue: "NumberFormatException",
//                             explanation:
//                                 "If details[0] or details[2] are not valid integers, Integer.parseInt() will throw a NumberFormatException.",
//                             line_start: 13,
//                             line_end: 14,
//                         },
//                         {
//                             issue: "ArithmeticException: / by zero",
//                             explanation:
//                                 "If secondNum is zero and the operator is '/', then an ArithmeticException will be thrown.",
//                             line_start: 23,
//                             line_end: 23,
//                         },
//                     ],
//                 },
//             },
//         },
//     };