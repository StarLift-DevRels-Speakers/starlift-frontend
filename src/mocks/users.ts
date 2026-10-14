import type { UserProfile } from '@/types/domain';
import type { Role } from '@/types/role';

// Demo accounts from StarLift_Макеты.html (`seed()`) until authentication is connected.
export const profiles: Record<Role, UserProfile> = {
  speaker: {
    id: 'ivan-ivanov',
    name: 'Иван Иванов',
    position: 'Senior Java Developer',
    company: 'Технологическая компания',
    city: 'Екатеринбург',
    skills: 'Java, Spring Boot, Архитектура',
    preferences: 'Онлайн и офлайн, Россия, техническая аудитория',
    about: 'Рассказываю о надежных backend-сервисах и архитектурных решениях.',
  },
  devrel: {
    id: 'anna',
    name: 'Анна',
    position: 'DevRel-специалист',
    company: 'Технологическая компания',
    city: 'Москва',
    skills: '',
    preferences: '',
    about: 'Организация выступлений и поиск технических экспертов.',
  },
};
