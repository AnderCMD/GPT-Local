// ? Dependencias
import { CreateWebWorkerMLCEngine } from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm';

// ? Elementos del DOM
const $ = (el) => document.querySelector(el);

// * El simbolo $ indica que es un elemento del DOM
// ? Elementos del DOM
const $form = $('form');
const $input = $('input');
const $template = $('#MessageTemplate');
const $messages = $('ul');
const $container = $('main');
const $button = $('button');
const $info = $('small');
const $loading = $('.Loading');

// ? Variables
let messages = [];
let end = false;

// ? Modelo seleccionado
const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k';

// ? Motor de inferencia
const engine = await CreateWebWorkerMLCEngine(
	new Worker('/JavaScript/Worker.js', { type: 'module' }),
	SELECTED_MODEL,
	{
		// ? Callback para el progreso
		initProgressCallback: (info) => {
			$info.textContent = info.text;
			if (info.progress === 1 && !end) {
				end = true;
				$loading?.parentNode?.removeChild($loading);
				$button.removeAttribute('disabled');
				addMessage(
					'¡Hola! ¿En qué puedo ayudarte hoy?',
					'Bot'
				);
				$input.focus();
			}
		},
	}
);

// ? Eventos
$form.addEventListener('submit', async (event) => {
    // Evitar que el formulario se envíe
    event.preventDefault();

    // Obtener el texto del input
	const messageText = $input.value.trim();

    // Si el mensaje no está vacío
	if (messageText !== '') {
		// añadimos el mensaje en el DOM
		$input.value = '';
	}

    // Añadir mensaje del usuario
	addMessage(messageText, 'user');
	$button.setAttribute('disabled', '');

    // Crear mensaje del usuario
	const userMessage = {
		role: 'user',
		content: messageText,
	};

    // Añadir mensaje a la lista de mensajes
	messages.push(userMessage);

    // Crear mensajes
	const chunks = await engine.chat.completions.create({
		messages,
		stream: true,
	});

    // Responder
	let reply = '';

    // Añadir mensaje del bot
	const $botMessage = addMessage('', 'bot');

    // Recorrer los mensajes
	for await (const chunk of chunks) {
		const choice = chunk.choices[0];
		const content = choice?.delta?.content ?? '';
		reply += content;
		$botMessage.textContent = reply;
	}

    // Habilitar el botón
	$button.removeAttribute('disabled');
	messages.push({
		role: 'assistant',
		content: reply,
	});
	$container.scrollTop = $container.scrollHeight;
});

// ? Agregar mensaje
function addMessage(text, sender) {
    // Clonar el template
	const clonedTemplate = $template.content.cloneNode(true);
	const $newMessage = clonedTemplate.querySelector('.Message');

    // Obtener el texto y el emisor
	const $who = $newMessage.querySelector('span');
	const $text = $newMessage.querySelector('p');

    // Asignar el texto y el emisor
	$text.textContent = text;
	$who.textContent = sender === 'bot' ? 'GPT' : 'Tú';
	$newMessage.classList.add(sender);

    // Añadir el mensaje al DOM
	$messages.appendChild($newMessage);

    // Scroll
	$container.scrollTop = $container.scrollHeight;

    // Devolver el texto
	return $text;
}
