"use client"

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Send, User, X, Sparkles, Loader2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/services/auth-context'
import ReactMarkdown from 'react-markdown'

export function TrainerAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const { authUser, session } = useAuth()
    
    // Use ref to always get latest authUser and session in the transport body function
    const authUserRef = useRef(authUser)
    const sessionRef = useRef(session)
    useEffect(() => {
        authUserRef.current = authUser
        sessionRef.current = session
        console.log('[TrainerAssistant] authUser updated:', authUser?.id)
    }, [authUser, session])
    
    // Create transport with ownerId and accessToken in body - use function with ref to get latest value on each request
    const transport = useMemo(() => {
        return new DefaultChatTransport({
            api: '/api/chat',
            body: () => {
                const ownerId = authUserRef.current?.id
                const accessToken = sessionRef.current?.access_token
                console.log('[TrainerAssistant] Sending request with ownerId:', ownerId, 'hasToken:', !!accessToken)
                return {
                    ownerId,
                    accessToken,
                }
            },
        })
    }, []) // Empty deps - transport is stable, body function uses ref
    
    const { messages, sendMessage, status, setMessages, stop } = useChat({
        transport,
    })
    const isLoading = status === 'streaming' || status === 'submitted'
    const scrollRef = useRef<HTMLDivElement>(null)
    const handledRoutineMessageIds = useRef<Set<string>>(new Set())
    const resetChat = () => {
        stop?.()
        setMessages([])
        handledRoutineMessageIds.current.clear()
        setInputValue('')
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        const toSend = inputValue
        // Clear input immediately for snappy UX
        setInputValue('')
        await sendMessage({ role: 'user', content: toSend } as any)
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])
    
    // Detect assistant confirmation of routine creation and trigger routines refresh
    useEffect(() => {
        for (const m of messages) {
            const msg: any = m
            if (msg.role !== 'assistant') continue
            if (!msg.id || handledRoutineMessageIds.current.has(msg.id)) continue

            // Extract text content (content or parts)
            let textContent: string = msg.content || ''
            if (!textContent && msg.parts) {
                const textPart = msg.parts.find((p: any) => p.type === 'text')
                textContent = textPart?.text || ''
            }

            const normalized = (textContent || '').toLowerCase()
            const mentionsRoutineCreation = normalized.includes('rutina creada') || normalized.includes('rutina \"') || normalized.includes('rutina “')
            const mentionsSuccessEmoji = textContent?.includes('✅')

            if (mentionsRoutineCreation || mentionsSuccessEmoji) {
                handledRoutineMessageIds.current.add(msg.id)

                // Dispatch a custom event so RoutinesTab can refresh immediately
                window.dispatchEvent(new CustomEvent('treino:routine-created', {
                    detail: {
                        source: 'trainer-assistant',
                        messageId: msg.id
                    }
                }))

            }
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
                        <CardTitle className="text-base">Treinus</CardTitle>
                        <p className="text-xs text-muted-foreground">Powered by AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Reiniciar conversación"
                        onClick={resetChat}
                        className="h-8 w-8"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto p-4 space-y-4"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 space-y-4 opacity-60">
                            <Bot className="h-12 w-12 mb-2" />
                            <p>Hola! Puedo ayudarte a crear rutinas o buscar alternatives.</p>
                            <div className="grid grid-cols-1 gap-2 w-full max-w-xs text-sm">
                                <Button variant="outline" size="sm" className="justify-start h-auto py-2 px-3" onClick={() => {
                                    setInputValue("Hace una rutina de pecho para un principiante");
                                }}>
                                    "Hace una rutina de pecho..."
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start h-auto py-2 px-3" onClick={() => {
                                    setInputValue("Sugiere alternativas para Press de Banca");
                                }}>
                                    "Alternativas para Press de Banca..."
                                </Button>
                            </div>
                        </div>
                    )}

                    {messages.map((m: any) => {
                        // Extract text content - handle both 'content' and 'parts' formats
                        let textContent = m.content;
                        if (!textContent && m.parts) {
                            const textPart = m.parts.find((p: any) => p.type === 'text');
                            textContent = textPart?.text || '';
                        }
                        
                        // Skip assistant messages with no meaningful text content
                        // This filters out tool-only messages and partial messages
                        if (m.role === 'assistant') {
                            const trimmedContent = (textContent || '').trim();
                            if (!trimmedContent || trimmedContent.length < 5) {
                                return null;
                            }
                        }
                        
                        return (
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
                                    {m.role === 'user' ? (
                                        <div className="whitespace-pre-wrap">{textContent}</div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_code]:bg-background/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
                                            <ReactMarkdown>{textContent}</ReactMarkdown>
                                        </div>
                                    )}
                                    {m.role === 'user' && <User className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />}
                                </div>
                            </div>
                        );
                    })}

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
