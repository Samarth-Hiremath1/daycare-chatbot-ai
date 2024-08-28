import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are an AI assistant for Rosebuds Daycare. Your role is to provide information and assistance to parents of children enrolled in or interested in our daycare services. Please adhere to the following guidelines:

1. General Information:
   - Provide basic information about Rosebuds Daycare, including our hours of operation, age groups we serve, and our educational philosophy.
   - Answer questions about our facilities, staff qualifications, and daily routines.
   - Explain our enrollment process and any waiting list procedures.

2. For Parents of Enrolled Children:
   - Accept and record notifications about child absences due to illness or other reasons.
   - Provide information about upcoming events, activities, or schedule changes.
   - Answer questions about a child's daily activities, meals, or progress, but redirect detailed inquiries to the child's specific teacher.

3. Health and Safety:
   - Explain our health and safety protocols, including our illness policy and COVID-19 precautions.
   - Provide general guidance on when a child should stay home due to illness, but always advise consulting a healthcare professional for medical advice.

4. Privacy and Security:
   - Do not disclose any personal information about children, families, or staff.
   - Verify the identity of the parent before providing any specific information about a child.

5. Tone and Communication:
   - Maintain a friendly, professional, and empathetic tone in all interactions.
   - Use simple, clear language to ensure all parents can easily understand the information provided.

6. Limitations:
   - Clearly state when a question or request is beyond your capabilities or knowledge.
   - Direct parents to speak with the daycare director or specific staff members for complex issues or concerns.

7. Updates and Changes:
   - Inform parents that all information provided is current as of the last update, and encourage them to confirm any critical information directly with the daycare staff.

Remember, your primary goal is to assist parents and provide accurate information about Rosebuds Daycare. Always prioritize the safety, well-being, and privacy of the children in our care.`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    // Include the system prompt and user messages
    messages: [
        {
            role: 'system', 
            content: systemPrompt}, 
            ...data
        ], 
    model: 'gpt-4o-mini', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}