
package com.example.demo.service;

import com.example.demo.model.Feedback;
import java.util.List;

public interface FeedbackService {

    Feedback createFeedback(Feedback feedback, Long userId);

    List<Feedback> getAllFeedback();

    void deleteFeedback(Long id);
}
