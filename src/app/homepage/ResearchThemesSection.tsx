'use client'
import Image from 'next/image'
import { Color, FontVariant, ScreenSize } from '@/app/theme'
import styled from '@emotion/styled'
import { CURRENT_MEMBERS as MEMBERS, Member } from '@/data/members'
import { ResearchTopics, PUBLICATIONS, type ResearchTopicType, Publication } from '@/data/publications'
import { useMemo } from 'react'
import { Section, SectionHeader, Text } from './Styles'
import Link from 'next/link'
import { uniq } from 'lodash'

const ResearchTopicsArea = styled.div`
  display: grid;
  gap: 48px;
  grid-template-columns: repeat(auto-fit, minmax(min(330px, 46%), 1fr)); // empirically, this works well
`

const ResearchTopicItem = styled.div`
  padding: 24px 36px;
  min-width: 300px;
  border: thin solid ${Color.gray500};
  border-radius: 15px;
  &:hover {
    box-shadow: 0px 0px 10px 0px ${Color.orange700};
    border: thin solid ${Color.orange700};
  }
  transition: box-shadow 0.3s ease-in-out;
`

const ResearchTopicItemTitle = styled.h3`
  ${FontVariant.title_md}
`

const ResearchTopicMembersArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 8px;
`

const ResearchTopicsMemberAvatar = styled(Image)`
  border-radius: 50%;
`

const GatherStatsByResearchTopic = () => {
  const statsByResearchTopic: Record<ResearchTopicType, { numPublications: number; authors: Member[] }> = {} as any
  Object.keys(ResearchTopics).forEach(topic => {
    const researchTopicKey = topic as ResearchTopicType
    const filteredPublications: Publication[] = PUBLICATIONS.filter(publication =>
      publication.topics.includes(researchTopicKey)
    ).sort((a, b) => b.year - a.year)
    const numPublications = filteredPublications.length
    // TODO: Change the MEMBERS data structure. The current structure is not optimized for this sort of filtering algorithm.
    // Algorithm: First authors are shown first with most recent publication, then the rest of the authors
    const topicAuthors = uniq(
      filteredPublications
        .flatMap(publication => publication.authors[0])
        .concat(filteredPublications.flatMap(publication => publication.authors.slice(1)))
    )
    const filteredAuthors: Member[] = topicAuthors.filter(entry => {
      if (entry instanceof Object && entry.isAlumni !== true) {
        // TODO: Optimize this condition
        return entry
      }
    })

    statsByResearchTopic[researchTopicKey] = { numPublications, authors: filteredAuthors }
  })
  return statsByResearchTopic
}

export const ResearchThemesSection = () => {
  const [statsByResearchTopic, numVisible] = useMemo(() => {
    // TODO: Specify the type of membersByResearchTopic
    const statsByResearchTopic: Record<ResearchTopicType, any> = GatherStatsByResearchTopic()
    return [statsByResearchTopic, 5]
  }, [])

  return (
    <Section id="research-section">
      <SectionHeader title="Research Themes" subtitle="Discover the research happening at KIXLAB" />
      <ResearchTopicsArea>
        {Object.entries(statsByResearchTopic)
          .sort(([, a], [, b]) => b.numPublications - a.numPublications) // Sort in descending order
          .map(([topic, stats]) => {
            return (
              <Link
                href={`/publications/?researchTopic=${topic}`}
                key={topic}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <ResearchTopicItem key={topic}>
                  <ResearchTopicItemTitle style={{ textTransform: 'capitalize' }}>
                    {ResearchTopics[topic as ResearchTopicType].emoji}
                    <br />
                    {topic}
                  </ResearchTopicItemTitle>
                  <Text style={{ color: 'gray', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>{stats.numPublications}</span> publications
                  </Text>
                  <ResearchTopicMembersArea>
                    {stats.authors.slice(0, numVisible).map((member: Member) => (
                      <ResearchTopicsMemberAvatar
                        width={36}
                        height={36}
                        src={`/members/${member.img}`}
                        alt={`${member.firstName} ${member.lastName}`}
                        key={member.email}
                      />
                    ))}

                    {/* Conditional rendering optimized */}
                    {stats.authors.length - numVisible > 0 && (
                      <span style={{ width: '36px', textAlign: 'center' }}>+{stats.authors.length - numVisible}</span>
                    )}
                  </ResearchTopicMembersArea>
                </ResearchTopicItem>
              </Link>
            )
          })}
      </ResearchTopicsArea>
    </Section>
  )
}
