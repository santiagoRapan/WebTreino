"use client"

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Send, User, X, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TrainerAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const { messages, sendMessage, status } = useChat()
    const isLoading = status === 'streaming' || status === 'submitted'
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        await sendMessage({ role: 'user', content: inputValue } as any)
        setInputValue('')
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg p-0 bg-primary hover:bg-primary/90 transition-all duration-300 z-50"
            >
                <Sparkles className="h-6 w-6 text-primary-foreground" />
            </Button>
        )
    }

    return (
        <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] md:w-[400px] h-[calc(100vh-2rem)] md:h-[600px] max-w-[400px] shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Trainer Assistant</CardTitle>
                        <p className="text-xs text-muted-foreground">Powered by AI</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto p-4 space-y-4"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 space-y-4 opacity-60">
                            <Bot className="h-12 w-12 mb-2" />
                            <p>Hello! I can help you design workouts or find exercise alternatives.</p>
                            <div className="grid grid-cols-1 gap-2 w-full max-w-xs text-sm">
                                <Button variant="outline" size="sm" className="justify-start h-auto py-2 px-3" onClick={() => {
                                    setInputValue("Create a chest workout for a beginner");
                                }}>
                                    "Create a chest workout..."
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start h-auto py-2 px-3" onClick={() => {
                                    setInputValue("Suggest alternatives for Bench Press");
                                }}>
                                    "Alternatives for Bench Press..."
                                </Button>
                            </div>
                        </div>
                    )}

                    {messages.map((m: any) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex w-full",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex gap-2 max-w-[85%] rounded-lg px-4 py-3 text-sm",
                                    m.role === 'user'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                {m.role !== 'user' && <Bot className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />}
                                <div className="whitespace-pre-wrap">{m.content}</div>
                                {m.role === 'user' && <User className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="bg-muted rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                <Bot className="h-4 w-4 opacity-70" />
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-xs opacity-70">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background">
                <form onSubmit={handleFormSubmit} className="flex w-full gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about workouts..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
